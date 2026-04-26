import { useState, useEffect } from 'react'
import Timeline from './Timeline'
import Map from './Map'
import PhotoGrid from './PhotoGrid'
import axios from 'axios'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [viewMode, setViewMode] = useState('both') // 'timeline', 'map', 'both'

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/status')
      setIsAuthenticated(response.data.authenticated)
    } catch (err) {
      console.error('Failed to check auth status:', err)
      setIsAuthenticated(true)
    }
  }

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('photos', files[i])
      }

      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const sortedPhotos = response.data.photos.sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      )
      setPhotos(sortedPhotos)
      e.target.value = ''
    } catch (err) {
      console.error('Failed to upload photos:', err)
      alert('写真のアップロードに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // Check for auth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('authenticated') === 'true') {
      setIsAuthenticated(true)
      window.history.replaceState({}, document.title, window.location.pathname)
      fetchPhotos()
    }
  }, [])

  const photosWithLocation = photos.filter(p => p.location?.latitude && p.location?.longitude)
  const photosByDate = groupPhotosByDate(photos)

  const filteredPhotos = selectedDate
    ? photos.filter(p => p.date?.split('T')[0] === selectedDate)
    : photos

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-indigo-600">旅行メモリーズ</h1>
          <p className="text-gray-600 mt-2">2026年3月15日～4月3日</p>
          {isAuthenticated && (
            <label className="mt-4 inline-block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer inline-block">
                写真を追加
              </span>
            </label>
          )}
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">旅行写真をアップロード</h2>
            <p className="text-gray-600 mb-6">
              3月15日～4月3日の旅行写真を選択して、
              <br />
              地図上で場所を表示します
            </p>
            <label className="block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold cursor-pointer inline-block">
                写真を選択
              </span>
            </label>
            <button
              onClick={handleLogin}
              className="mt-4 px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
            >
              または Google Photos から取得
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">写真を読み込み中...</p>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* View Mode Selector */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setViewMode('both')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                viewMode === 'both' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-600'
              }`}
            >
              両方表示
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                viewMode === 'timeline' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-600'
              }`}
            >
              タイムライン
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                viewMode === 'map' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-600'
              }`}
            >
              地図
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-indigo-600">{photos.length}</div>
              <div className="text-gray-600">撮影枚数</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-green-600">{photosWithLocation.length}</div>
              <div className="text-gray-600">位置情報あり</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-3xl font-bold text-blue-600">{Object.keys(photosByDate).length}</div>
              <div className="text-gray-600">訪問日数</div>
            </div>
          </div>

          {/* Content */}
          {(viewMode === 'timeline' || viewMode === 'both') && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">タイムライン</h2>
              <Timeline
                photos={photos}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSelectPhoto={setSelectedPhoto}
              />
            </div>
          )}

          {(viewMode === 'map' || viewMode === 'both') && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">訪問地マップ</h2>
              <Map
                photos={photosWithLocation}
                selectedPhoto={selectedPhoto}
                onSelectPhoto={setSelectedPhoto}
              />
            </div>
          )}

          {(viewMode === 'timeline' || viewMode === 'both') && selectedDate && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {selectedDate}の写真
              </h2>
              <PhotoGrid
                photos={filteredPhotos}
                onSelectPhoto={setSelectedPhoto}
                selectedPhoto={selectedPhoto}
              />
            </div>
          )}
        </main>
      )}
    </div>
  )
}

function groupPhotosByDate(photos) {
  return photos.reduce((acc, photo) => {
    const date = photo.date?.split('T')[0] || 'Unknown'
    if (!acc[date]) acc[date] = 0
    acc[date]++
    return acc
  }, {})
}

export default App
