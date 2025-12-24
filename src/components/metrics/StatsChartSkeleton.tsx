const StatsChartSkeleton = () => {
  return (
    <div className="h-[320px] w-full bg-white rounded-xl shadow-sm border border-border/60 p-5">
      <div className="h-full w-full flex flex-col justify-between animate-pulse">
        {/* Chart area skeleton */}
        <div className="flex-1 relative">
          {/* Y-axis values skeleton */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-4">
            <div className="h-3 w-8 bg-gray-200 rounded"></div>
            <div className="h-3 w-6 bg-gray-200 rounded"></div>
            <div className="h-3 w-8 bg-gray-200 rounded"></div>
            <div className="h-3 w-6 bg-gray-200 rounded"></div>
          </div>

          {/* Chart line skeleton */}
          <div className="ml-12 mr-8 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              <div className="h-px bg-gray-100"></div>
              <div className="h-px bg-gray-100"></div>
              <div className="h-px bg-gray-100"></div>
              <div className="h-px bg-gray-100"></div>
            </div>

            {/* Simulated chart line with dots */}
            <div className="absolute inset-0 flex items-end justify-between px-2">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mb-1"></div>
                <div className="h-16 w-px bg-gray-200"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mb-1"></div>
                <div className="h-24 w-px bg-gray-200"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mb-1"></div>
                <div className="h-12 w-px bg-gray-200"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mb-1"></div>
                <div className="h-32 w-px bg-gray-200"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mb-1"></div>
                <div className="h-8 w-px bg-gray-200"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mb-1"></div>
                <div className="h-28 w-px bg-gray-200"></div>
              </div>
            </div>

            {/* Connecting line skeleton */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M 10,80 Q 25,60 40,70 T 70,40 T 90,50"
                stroke="#d1d5db"
                strokeWidth="2"
                fill="none"
                className="opacity-60"
              />
            </svg>
          </div>
        </div>

        {/* X-axis labels skeleton */}
        <div className="flex justify-between items-center mt-4 px-12">
          <div className="h-3 w-6 bg-gray-200 rounded"></div>
          <div className="h-3 w-6 bg-gray-200 rounded"></div>
          <div className="h-3 w-6 bg-gray-200 rounded"></div>
          <div className="h-3 w-6 bg-gray-200 rounded"></div>
          <div className="h-3 w-6 bg-gray-200 rounded"></div>
          <div className="h-3 w-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default StatsChartSkeleton
