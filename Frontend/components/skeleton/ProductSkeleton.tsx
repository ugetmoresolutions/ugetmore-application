// Skeleton Components
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    {/* Image skeleton */}
    <Skeleton className="w-full h-48 mb-4" />
    
    {/* Product name skeleton */}
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    
    {/* Price skeleton */}
    <Skeleton className="h-6 w-20" />
  </div>
);

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 12 }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

const SidebarSkeleton = () => (
  <div className="flex flex-col lg:flex-row gap-4">
    {/* Main Categories Skeleton */}
    <div className="flex-1 min-w-0 bg-[#F9F9FB] p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
      <Skeleton className="h-6 w-24 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
    
    {/* Subcategories Skeleton */}
    <div className="flex-1  min-w-0 bg-[#F9F9FB]  lg:p-6 rounded-lg shadow-sm border border-gray-200">
      <Skeleton className="h-6 w-28 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="p-2">
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export { Skeleton, ProductCardSkeleton, ProductGridSkeleton, SidebarSkeleton };