function PhotoGrid({ photos, selectedPhoto, onSelectPhoto }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map(photo => (
        <div
          key={photo.id}
          className={`rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition transform hover:scale-105 ${
            selectedPhoto?.id === photo.id ? 'ring-4 ring-indigo-600' : ''
          }`}
          onClick={() => onSelectPhoto(photo)}
        >
          <div className="relative bg-gray-200 aspect-square overflow-hidden">
            <img
              src={photo.url}
              alt={photo.filename}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {photo.location?.latitude && photo.location?.longitude && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                📍 位置情報
              </div>
            )}
          </div>
          <div className="p-3 bg-white">
            <p className="text-sm text-gray-600 truncate">{photo.filename}</p>
            {photo.date && (
              <p className="text-xs text-gray-400 mt-1">
                {new Date(photo.date).toLocaleString('ja-JP')}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PhotoGrid
