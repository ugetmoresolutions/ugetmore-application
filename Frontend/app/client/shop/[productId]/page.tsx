import ProductDetailPage from '@/components/shop/ProductPage/ProductPage'
import { 
  loadProductFromAnySource,
  getRelatedProducts 
} from '@/utils/server-product-loader'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: {
  params: Promise<{ productId: string }>
}): Promise<Metadata> {
  // Await the params Promise
  const { productId } = await params
  
  console.log('🔍 [generateMetadata] Starting for product:', productId)
  
  try {
    const product = await loadProductFromAnySource(productId)
    
    if (!product) {
      console.log('❌ [generateMetadata] Product not found')
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.'
      }
    }

    console.log('✅ [generateMetadata] Product found:', {
      name: product.productName,
      supplier: product.supplier,
      price: product.price,
      inStock: product.isInStock
    })

    // Get image URL
    const getAbsoluteImageUrl = () => {
      if (!product) return ''
      
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0]
        
        if (firstImage && typeof firstImage === 'object') {
          if ('urls' in firstImage && Array.isArray(firstImage.urls) && firstImage.urls.length > 0) {
            return firstImage.urls[0].url
          }
          else if ('url' in firstImage && firstImage.url) {
            return firstImage.url as string
          }
        }
        else if (typeof firstImage === 'string') {
          return firstImage
        }
      }
      
      return '/placeholder-product.png'
    }

    const imageUrl = getAbsoluteImageUrl()
    const absoluteImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://u-getmo-fe-4rtl.vercel.app'}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
    
    const absolutePageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://u-getmo-fe-4rtl.vercel.app'}/client/shop/${productId}`
    const description = product.description?.substring(0, 160) || 'Check out this amazing product'

    return {
      title: `${product.productName} | UGETMO`,
      description: description,
      openGraph: {
        title: product.productName,
        description: description,
        images: [
          {
            url: absoluteImageUrl,
            width: 1200,
            height: 630,
            alt: product.productName,
          },
        ],
        url: absolutePageUrl,
        type: 'website',
        siteName: 'UGETMO',
      },
      twitter: {
        card: 'summary_large_image' as const,
        title: product.productName,
        description: description,
        images: [absoluteImageUrl],
      },
      alternates: {
        canonical: absolutePageUrl,
      },
    }
  } catch (error) {
    console.error('❌ [generateMetadata] Error:', error)
    return {
      title: 'Product Page',
      description: 'Product details page'
    }
  }
}

export default async function ProductPage({ 
  params 
}: {
  params: Promise<{ productId: string }>
}) {
  // Await the params Promise
  const { productId } = await params
  
  console.log('🚀 [ProductPage] Starting for product:', productId)
  
  try {
    const product = await loadProductFromAnySource(productId)
    
    if (!product) {
      console.log('❌ [ProductPage] Product not found')
      notFound()
    }

    
    
    const relatedProducts = await getRelatedProducts(product, productId)
    
    return (
      <div className='dark:bg-white w-full'>
        <ProductDetailPage 
          serverProduct={product}
          serverRelatedProducts={relatedProducts}
          productId={productId}
        />
      </div>
    )
  } catch (error) {
    console.error('❌ [ProductPage] Error:', error)
    notFound()
  }
}