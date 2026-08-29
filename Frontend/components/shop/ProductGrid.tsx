import React from 'react';
import ProductCard from './ProductCard';
import { IProduct, IProductPrice } from "@/interfaces/product/product";
import { IStockItem } from "@/interfaces/product/stock";

interface Product {
  id: string;
  imageSrc: string;
  productName: string;
  price: number;
  stockQuantity: number;
  isInStock: boolean;
  isCustomBranding?: boolean;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  allProducts?: IProduct[];
  productPrices?: IProductPrice[];
  stockItems?: IStockItem[];
  sourceCategory?: string;
  sourcePage?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  onAddToCart, 
  allProducts = [],
  productPrices = [],
  stockItems = [],
  sourceCategory,
  sourcePage = 'branding'
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          imageSrc={product.imageSrc}
          productName={product.productName}
          price={product.price}
          productId={product.id}
          onAddToCart={onAddToCart}
          allProducts={allProducts}
          productPrices={productPrices}
          stockItems={stockItems}
          sourceCategory={sourceCategory}
          sourcePage={sourcePage}
          stockQuantity={product.stockQuantity}
          isInStock={product.isInStock}
          isCustomBranding={product.isCustomBranding}
        />
      ))}
    </div>
  );
};

export default ProductGrid;