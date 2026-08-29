"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Tag, Image as ImageIcon, Star, Info, Settings, FileText, Palette, TrendingUp, ShoppingBag, DollarSign, BarChart3, Eye, Download, Share2, Edit3, Bookmark } from 'lucide-react';
import { IProduct, IProductPrice } from '@/interfaces/product/product';
import { Modal } from 'flowbite-react';

interface ProductDetailsModalProps {
  product: IProduct | null;
  productPrice?: IProductPrice;
  stockItem?: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ 
  product, 
  productPrice,
  stockItem,
  isOpen, 
  onClose 
}) => {
  if (!product) return null;

  const getProductImage = () => {
    if (product.images && product.images.length > 0) {
      const defaultImage = product.images.find(img => img.isDefault);
      const imageToUse = defaultImage || product.images[0];
      if (imageToUse && imageToUse.urls.length > 0) {
        return imageToUse.urls[0].url;
      }
    }
    return null;
  };

  const getStockStatus = () => {
    if (!stockItem || stockItem.stock <= 0) return { status: 'out', color: 'bg-rose-100 text-rose-700 border-rose-200', label: 'Out of Stock' };
    if (stockItem.stock <= 10) return { status: 'low', color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Low Stock' };
    return { status: 'in', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'In Stock' };
  };

  const stockStatus = getStockStatus();

  const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'variants' | 'analytics'>('overview');
  const [imageIndex, setImageIndex] = useState(0);
  
  const productImages = product.images || [];
  const currentImage = productImages[imageIndex] || productImages[0];
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'variants', label: 'Variants', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <AnimatePresence>
    <Modal
    show={isOpen}
    onClose={onClose}
    >
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 z-50 flex items-start justify-center pt-8 pb-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-slate-200">
              {/* Header */}
              <div className="relative  bg-black text-white p-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="relative">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-xl overflow-hidden border border-white/20 shadow-lg">
                          {getProductImage() ? (
                            <img 
                              src={getProductImage()!} 
                              alt={product.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-full h-full p-3 text-white/60" />
                          )}
                        </div>
                        {product.isLogo24 && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 p-1 rounded-full shadow-lg">
                            <Star className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2 text-white line-clamp-1">{product.productName}</h2>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                            {product.brand?.name || 'No Brand'}
                          </span>
                          <span className="bg-emerald-500/20 backdrop-blur text-emerald-100 px-3 py-1 rounded-full text-xs font-medium border border-emerald-400/30">
                            {product.simpleCode}
                          </span>
                          {product.brandings && product.brandings.length > 0 && (
                            <span className="bg-purple-500/20 backdrop-blur text-purple-100 px-3 py-1 rounded-full text-xs font-medium border border-purple-400/30">
                              <Palette className="w-3 h-3 inline mr-1" />
                              Customizable
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/80">
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>{product.categories?.[0]?.name || 'Uncategorized'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            <span>{product.type || 'Product'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* <button className="p-2 bg-white/10 backdrop-blur hover:bg-white/20 rounded-lg border border-white/20 transition-all">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white/10 backdrop-blur hover:bg-white/20 rounded-lg border border-white/20 transition-all">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white/10 backdrop-blur hover:bg-white/20 rounded-lg border border-white/20 transition-all">
                        <Download className="w-4 h-4" />
                      </button> */}
                      <button
                        onClick={onClose}
                        className="p-2 bg-white/10 backdrop-blur hover:bg-white/20 rounded-lg border border-white/20 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Price & Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
                      <div className="flex items-center justify-between mb-1">
                        
                        <span className="text-xs text-white/60 uppercase tracking-wider">Price</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        {productPrice ? `R${productPrice.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
                      <div className="flex items-center justify-between mb-1">
                        <ShoppingBag className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-white/60 uppercase tracking-wider">Stock</span>
                      </div>
                      <p className="text-lg font-bold text-white">{stockItem?.stock || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
                      <div className="flex items-center justify-between mb-1">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-white/60 uppercase tracking-wider">Variants</span>
                      </div>
                      <p className="text-lg font-bold text-white">{product.variants?.length || 0}</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/20">
                      <div className="flex items-center justify-between mb-1">
                        <Palette className="w-4 h-4 text-pink-400" />
                        <span className="text-xs text-white/60 uppercase tracking-wider">Branding</span>
                      </div>
                      <p className="text-lg font-bold text-white">{product.brandings?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tabs Navigation */}
              <div className="bg-slate-50 border-b border-slate-200">
                <div className="flex">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 text-sm font-semibold transition-all relative ${
                          activeTab === tab.id
                            ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 max-h-[50vh] overflow-y-auto">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Product Details Grid */}
                    <div className="grid grid-cols-3 gap-8">
                      <div className="col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                            Product Information
                          </h3>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Product Code</p>
                                <p className="text-lg font-bold text-slate-900">{product.simpleCode}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Code</p>
                                <p className="text-slate-700 font-medium">{product.fullCode}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</p>
                                <p className="text-slate-700 font-medium">{product.type}</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Material</p>
                                <p className="text-slate-700 font-medium">{product.material || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender</p>
                                <p className="text-slate-700 font-medium">{product.gender || 'Unisex'}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Fit</p>
                                <p className="text-slate-700 font-medium">{product.fit || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Inventory Information */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                            Inventory & Pricing
                          </h3>
                          <div className="grid grid-cols-3 gap-6">
                            <div className="text-center bg-white/60 rounded-xl p-4 border border-emerald-200">
                              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Min Order</p>
                              <p className="text-2xl font-bold text-slate-900">{product.minimum || 'N/A'}</p>
                            </div>
                            <div className="text-center bg-white/60 rounded-xl p-4 border border-emerald-200">
                              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Max Order</p>
                              <p className="text-2xl font-bold text-slate-900">{product.maximum || 'N/A'}</p>
                            </div>
                            <div className="text-center bg-white/60 rounded-xl p-4 border border-emerald-200">
                              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Available</p>
                              <p className="text-2xl font-bold text-emerald-600">
                                {stockItem ? (stockItem.stock - (stockItem.reservedStock || 0)) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product Images */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                          <div className="aspect-square bg-slate-50 flex items-center justify-center">
                            {productImages.length > 0 && currentImage ? (
                              <img 
                                src={currentImage.urls[0]?.url}
                                alt={product.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-16 h-16 text-slate-300" />
                            )}
                          </div>
                        </div>
                        
                        {productImages.length > 1 && (
                          <div className="grid grid-cols-3 gap-2">
                            {productImages.slice(0, 6).map((image, index) => (
                              <button
                                key={index}
                                onClick={() => setImageIndex(index)}
                                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                                  imageIndex === index ? 'border-blue-500' : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <img 
                                  src={image.urls[0]?.url}
                                  alt={`${product.productName} ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Description */}
                    {product.description && (
                      <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Description</h3>
                        <div 
                          className="text-slate-700 leading-relaxed prose prose-slate max-w-none"
                          dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'branding' && (
                  <div className="space-y-6">
                    {product.brandings && product.brandings.length > 0 ? (
                      product.brandings.map((branding, index) => (
                        <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-bold text-slate-900">{branding.positionName}</h4>
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                              Multiplier: {branding.positionMultiplier}
                            </span>
                          </div>
                          {branding.method && branding.method.length > 0 && (
                            <div className="grid gap-4">
                              {branding.method.map((method, methodIndex) => (
                                <div key={methodIndex} className="bg-white/80 rounded-xl p-4 border border-purple-200">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-semibold text-slate-600">Method:</span>
                                      <span className="ml-2 text-slate-900">{method.brandingName}</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-600">Department:</span>
                                      <span className="ml-2 text-slate-900">{method.brandingDepartment}</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-600">Colors:</span>
                                      <span className="ml-2 text-slate-900">{method.numberOfColours}</span>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-slate-600">Size:</span>
                                      <span className="ml-2 text-slate-900">{method.maxPrintingSizeWidth}x{method.maxPrintingSizeHeight}mm</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Palette className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No branding options available</h3>
                        <p className="text-slate-600">This product doesn't have any branding configurations.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'variants' && (
                  <div className="space-y-6">
                    {product.variants && product.variants.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {product.variants.map((variant, index) => (
                          <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-slate-900">{variant.fullCode}</h4>
                                {variant.isLogo24 && (
                                  <div className="bg-yellow-100 text-yellow-700 p-1 rounded-full">
                                    <Star className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-slate-500 font-medium">Color</p>
                                  <p className="text-slate-900 font-semibold">{variant.codeColourName || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-medium">Size</p>
                                  <p className="text-slate-900 font-semibold">{variant.codeSizeName || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-medium">Weight</p>
                                  <p className="text-slate-900 font-semibold">{variant.productDimension?.weight || 'N/A'}kg</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 font-medium">Per Carton</p>
                                  <p className="text-slate-900 font-semibold">{variant.packagingAndDimension?.piecesPerCarton || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No variants available</h3>
                        <p className="text-slate-600">This product doesn't have any variants.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Analytics Coming Soon</h3>
                      <p className="text-slate-600">Product analytics and performance metrics will be available here.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    <span>Updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>ID: {product.simpleCode}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors text-sm"
                  >
                    Close
                  </button>
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg flex items-center gap-2 text-sm">
                    <Edit3 className="w-4 h-4" />
                    Edit Product
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
    </Modal>
    </AnimatePresence>
  );
};

export default ProductDetailsModal;
