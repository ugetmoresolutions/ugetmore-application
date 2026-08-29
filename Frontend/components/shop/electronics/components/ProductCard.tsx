// // ProductCard Component
// interface ProductCardProps {
//   imageSrc: string;
//   productName: string;
//   price: number;
//   productId: any;
//   onAddToCart?: (productId: any) => void;
//   stockQuantity?: number;
//   isInStock?: boolean;
// }

// const ProductCard: React.FC<ProductCardProps> = ({
//   imageSrc,
//   productName,
//   price,
//   productId,
//   onAddToCart,
//   stockQuantity = 0,
//   isInStock = true,
// }) => {
//   const router = useRouter();

//   // Determine if product is actually in stock
//   const inStock = isInStock && stockQuantity > 0;
//   const lowStock = inStock && stockQuantity <= 5;

//   const handleAddToCart = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!inStock) return;

//     if (onAddToCart) {
//       onAddToCart(productId);
//     } else {
//       console.log("Adding to cart:", productId);
//       alert(`Added ${productName} to cart!`);
//     }
//   };

//   const handleProductClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     router.push(`/client/shop/${productId}`);
//   };

//   return (
//     <div
//       onClick={handleProductClick}
//       className={`relative group overflow-hidden rounded-lg border border-gray-200 z-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer w-full max-w-xs mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${
//         !inStock ? "opacity-75" : ""
//       }`}
//     >
//       <div className="relative w-full h-48 xs:h-52 sm:h-56 md:h-60 lg:h-64 xl:h-72 bg-gray-100 flex items-center justify-center">
//         <Image
//           src={imageSrc}
//           alt={productName}
//           fill
//           className={`p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 object-contain ${
//             !inStock ? "grayscale" : ""
//           }`}
//         />

//         {!inStock && (
//           <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center">
//             <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1">
//               <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
//               Out of Stock
//             </div>
//           </div>
//         )}

//         {inStock && lowStock && (
//           <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
//             Only {stockQuantity} left
//           </div>
//         )}

//         {inStock && (
//           <div className="absolute bottom-2 right-2 xs:bottom-3 xs:right-3 sm:bottom-4 sm:right-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
//             <button
//               onClick={handleAddToCart}
//               className="p-1.5 xs:p-2 sm:p-2 md:p-2.5 lg:p-3 bg-[#29367C] rounded-full shadow-lg hover:bg-[#1e2a5e] transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#29367C] focus:ring-offset-2"
//               aria-label={`Add ${productName} to cart`}
//             >
//               <ShoppingCart className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
//             </button>
//           </div>
//         )}

//         {!inStock && (
//           <div className="absolute bottom-2 right-2 xs:bottom-3 xs:right-3 sm:bottom-4 sm:right-4">
//             <button
//               disabled
//               className="p-1.5 xs:p-2 sm:p-2 md:p-2.5 lg:p-3 bg-gray-400 rounded-full shadow-lg cursor-not-allowed"
//               aria-label="Out of stock"
//             >
//               <ShoppingCart className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6">
//         <h3
//           className={`text-xs xs:text-sm sm:text-sm md:text-base lg:text-lg font-medium line-clamp-2 ${
//             !inStock ? "text-gray-500" : "text-gray-700"
//           }`}
//         >
//           {productName}
//         </h3>
//         <div className="flex items-center justify-between mt-1">
//           <p
//             className={`text-sm xs:text-base sm:text-base md:text-lg lg:text-xl font-semibold ${
//               !inStock ? "text-gray-500" : "text-gray-900"
//             }`}
//           >
//             ZAR {price.toFixed(2)}
//           </p>
//           {!inStock && (
//             <span className="text-xs text-red-600 font-medium">
//               Out of Stock
//             </span>
//           )}
//           {inStock && lowStock && (
//             <span className="text-xs text-orange-600 font-medium">
//               Low Stock
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };