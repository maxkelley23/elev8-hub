export default function CampaignCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden animate-pulse">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          {/* Status badge skeleton */}
          <div className="h-6 w-16 bg-gray-200 rounded-full ml-2"></div>
        </div>

        {/* Subtitle skeleton */}
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>

        {/* Stats skeletons */}
        <div className="flex gap-4">
          <div>
            <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
            <div className="h-5 bg-gray-200 rounded w-8"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
            <div className="h-5 bg-gray-200 rounded w-8"></div>
          </div>
          <div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-5 bg-gray-200 rounded w-8"></div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-100 flex items-center justify-between">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
