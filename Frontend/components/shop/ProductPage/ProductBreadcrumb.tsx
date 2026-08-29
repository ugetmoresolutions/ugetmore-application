// components/ProductBreadcrumb.tsx
'use client'

import React, { useEffect, useState } from 'react';
import { IProduct } from "@/interfaces/product/product";
import Link from 'next/link';

interface ProductBreadcrumbProps {
  product: IProduct;
}

const ProductBreadcrumb: React.FC<ProductBreadcrumbProps> = ({ product }) => {
  const [backLink, setBackLink] = useState({ href: '/client/shop/all', label: 'All Products' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('last_shop_route');

    if (stored) {
      const parsed = JSON.parse(stored);
      setBackLink({
        href: parsed.path,
        label: parsed.name
      });
    } else {
      const categoryName = product.categories?.[0]?.name;
      if (categoryName) {
        const simpleSlug = categoryName.toLowerCase().replace(' ', '-');
        // setBackLink({ href: `/client/shop/${simpleSlug}`, label: categoryName });
      }
    }
    setIsLoaded(true);
  }, [product]);

  const getCategoryUrl = (categoryName: string) => {
    const separator = backLink.href.includes('?') ? '&' : '?';
    return `${backLink.href}${separator}category=${encodeURIComponent(categoryName)}`;
  };

  const hasCategory = product.categories?.[0];

  if (!isLoaded) return <nav className="mb-8 h-6" />;

  return (
    <nav className="mb-8">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <Link href="/" className="hover:text-gray-700">Home</Link>
        </li>
        <li>{">"}</li>

        {/* DYNAMIC BACK LINK */}
        <li>
          <Link
            href={backLink.href}
            className="hover:text-gray-700"
          >
            {backLink.label}
          </Link>
        </li>

        {/* CATEGORY STEP */}
        {hasCategory && (
          <>
            <li>{">"}</li>
            <li>
              <Link
                href={getCategoryUrl(hasCategory.name)}
                className="hover:text-gray-700"
              >
                {hasCategory.name}
              </Link>
            </li>
          </>
        )}

        <li>{">"}</li>
        <li className="text-gray-900 truncate">{product.productName}</li>
      </ol>
    </nav>
  );
};

export default ProductBreadcrumb;