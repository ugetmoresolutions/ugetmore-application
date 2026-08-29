export const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm w-full max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
      >
        <div className="w-full h-48 xs:h-52 sm:h-56 md:h-60 lg:h-64 xl:h-72 bg-gray-200 animate-pulse"></div>
        <div className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
          <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

