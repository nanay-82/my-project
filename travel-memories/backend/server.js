import express from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// Google OAuth Configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3001/api/auth/callback';

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// In-memory token storage (for demo - use database in production)
let accessToken = null;

// Generate OAuth URL
app.get('/api/auth/login', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/photoslibrary.readonly'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  res.json({ authUrl: url });
});

// OAuth Callback Handler
app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    accessToken = tokens.access_token;
    oauth2Client.setCredentials(tokens);
    res.redirect('http://localhost:5173?authenticated=true');
  } catch (err) {
    console.error('OAuth error:', err);
    res.status(400).json({ error: 'Authentication failed' });
  }
});

// Get photos with metadata
app.get('/api/photos', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    oauth2Client.setCredentials({ access_token: accessToken });

    // Google Photos Library API endpoint
    const response = await axios.post(
      'https://photoslibrary.googleapis.com/v1/mediaItems:search',
      {
        pageSize: 100,
        filters: {
          dateFilter: {
            ranges: [
              {
                startDate: { year: 2026, month: 3, day: 15 },
                endDate: { year: 2026, month: 4, day: 3 },
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const photos = response.data.mediaItems || [];

    // Fetch detailed EXIF data for each photo
    const enrichedPhotos = await Promise.all(
      photos.map(async (photo) => {
        try {
          const detailResponse = await axios.get(
            `https://photoslibrary.googleapis.com/v1/mediaItems/${photo.id}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const item = detailResponse.data;
          const location = item.mediaMetadata?.location || {};

          return {
            id: photo.id,
            filename: photo.filename,
            url: photo.baseUrl,
            mimeType: photo.mimeType,
            date: item.mediaMetadata?.creationTime,
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          };
        } catch (err) {
          console.error(`Failed to fetch details for ${photo.id}:`, err);
          return {
            id: photo.id,
            filename: photo.filename,
            url: photo.baseUrl,
            mimeType: photo.mimeType,
            date: null,
            location: {},
          };
        }
      })
    );

    res.json({ photos: enrichedPhotos });
  } catch (err) {
    console.error('Error fetching photos:', err);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.array('photos', 100), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const photos = req.files.map((file, index) => ({
      id: index.toString(),
      filename: file.originalname,
      url: `http://localhost:3001/uploads/${file.filename}`,
      mimeType: file.mimetype,
      date: new Date().toISOString(),
      location: {
        latitude: null,
        longitude: null,
      },
    }));

    res.json({ photos });
  } catch (err) {
    console.error('Error uploading files:', err);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: !!accessToken });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:5173 to start`);
});
