import { useMemo } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

function Timeline({ photos, selectedDate, onSelectDate, onSelectPhoto }) {
  const groupedByDate = useMemo(() => {
    const grouped = {}
    photos.forEach(photo => {
      const date = photo.date?.split('T')[0] || 'Unknown'
      if (!grouped[date]) grouped[date] = []
      grouped[date].push(photo)
    })
    return Object.keys(grouped).sort().reduce((acc, date) => {
      acc[date] = grouped[date]
      return acc
    }, {})
  }, [photos])

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, dayPhotos]) => (
        <div
          key={date}
          className={`p-4 rounded-lg cursor-pointer transition ${
            selectedDate === date
              ? 'bg-indigo-100 border-2 border-indigo-600'
              : 'bg-white border border-gray-200 hover:shadow-md'
          }`}
          onClick={() => onSelectDate(selectedDate === date ? null : date)}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {format(new Date(date), 'EEEE, MMMM d日', { locale: ja })}
              </h3>
              <p className="text-gray-600">{dayPhotos.length}枚の写真</p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end max-w-xs">
              {dayPhotos.slice(0, 3).map(photo => (
                <div
                  key={photo.id}
                  className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectPhoto(photo)
                  }}
                >
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {dayPhotos.length > 3 && (
                <div className="w-16 h-16 rounded-lg bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700">
                  +{dayPhotos.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Timeline
