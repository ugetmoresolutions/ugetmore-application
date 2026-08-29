import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Palette,
    Calendar,
    Package,
    FileText,
    Download,
    Upload,
    Settings,
    MapPin
} from 'lucide-react';
import { Modal } from 'flowbite-react';

// Types based on your interfaces
interface ColorQuantity {
    colorCode: string;
    colorName: string;
    quantity: number;
    unitPrice: number;
    images?: any[];
    selected: boolean;
}

interface BrandingMethod {
    brandingName: string;
    brandingDepartment: string;
    brandingCode: string;
    brandingInclusiveMethod: boolean;
    displayIndex: string;
    maxPrintingSizeWidth: string;
    maxPrintingSizeHeight: string;
    numberOfColours: string;
    brandingMultiplier: number;
    exclusions: any[];
}

interface BrandingPosition {
    id: string;
    name: string;
    code: string;
    selected: boolean;
    methods: BrandingMethod[];
    selectedMethod?: BrandingMethod;
    appliedToColors: string[];
}

interface ArtworkFile {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    url?: string;
    positionId?: string;
}

interface BrandingConfig {
    positionId: string;
    logoName: string;
    width: string;
    height: string;
    instructions: string;
    artworkFile?: ArtworkFile;
    appliedColors: string[];
    positionInBrandingArea: string;
    embroideryPosition?: string;
    artworkColorType: 'pantone' | 'marathon' | 'tone-on-tone' | 'match-to-artwork';
    pantoneColors: Array<{id: string, pantoneCode: string, exactColor: string, standardColor: string, selectedColor: string}>;
    brandingColors: string[];
    artworkOption?: 'upload' | 'previous' | 'design';
    designBrief?: string;
    companyName?: string;
    industry?: string;
    preferredColors?: string;
}

export interface BrandingSetup {
    selectedColors: ColorQuantity[];
    selectedPositions: BrandingPosition[];
    configurations: BrandingConfig[];
    artworkFiles: ArtworkFile[];
    totalCost: {
        basePrice: number;
        brandingCost: number;
        setupFees: number;
        designFees: number;
        grandTotal: number;
    };
}

interface BrandingPreviewModalProps {
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    brandingSetup?: BrandingSetup | null; // Made optional and nullable
    productName?: string;
    onConfirm?: () => void;
    isLoading?: boolean;
}

const BrandingPreviewModal: React.FC<BrandingPreviewModalProps> = ({
    showPreview,
    setShowPreview,
    brandingSetup,
    productName = "Custom Product",
    onConfirm,
    isLoading = false
}) => {

    // Default values to prevent destructuring errors
    const defaultBrandingSetup: BrandingSetup = {
        selectedColors: [],
        selectedPositions: [],
        configurations: [],
        artworkFiles: [],
        totalCost: {
            basePrice: 0,
            brandingCost: 0,
            setupFees: 0,
            designFees: 0,
            grandTotal: 0
        }
    };

    // Use default values if brandingSetup is null or undefined
    const safeBrandingSetup = brandingSetup || defaultBrandingSetup;

    const {
        selectedColors = [],
        selectedPositions = [],
        configurations = [],
        artworkFiles = [],
        totalCost = defaultBrandingSetup.totalCost
    } = safeBrandingSetup;

    // Safety checks for calculations
    const totalQuantity = selectedColors?.reduce((sum, color) => sum + (color?.quantity || 0), 0) || 0;
    const totalPositions = selectedPositions?.length || 0;
    const totalArtworkFiles = artworkFiles?.length || 0;

    // If no branding setup data, show a loading or empty state
    if (!brandingSetup) {
        return (
            <Modal show={showPreview} onClose={() => setShowPreview(false)}>
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6"
                    >
                        <div className="text-center">
                            <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Branding Data</h3>
                            <p className="text-gray-600 mb-4">No branding configuration available to display.</p>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            </Modal>
        );
    }

    return (
     <Modal
     show={showPreview}
     onClose={() => setShowPreview(false)}
     >

   <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[95vh] overflow-hidden"
            >
                {/* Header Bar */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-3 sm:p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-sm sm:text-lg font-semibold truncate">
                            <span className="hidden sm:inline">Branding Setup - Document Preview</span>
                            <span className="sm:hidden">Branding Preview</span>
                        </span>
                    </div>
                    <button
                        className="text-cyan-100 hover:text-white transition-colors p-1"
                        onClick={() => setShowPreview(false)}
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Document Content */}
                <div className="bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(95vh-100px)] md:max-h-[calc(95vh-80px)]">
                    {/* PDF Paper Effect */}
                    <div className="bg-white shadow-lg mx-auto" style={{ minHeight: '297mm', width: '100%', maxWidth: '210mm' }}>
                        <div className="p-4 sm:p-6 md:p-8 lg:p-12">
                            {/* Document Header */}
                            <div className="border-b-2 border-gray-800 pb-4 sm:pb-6 mb-6 sm:mb-8">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div>
                                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                                            <span className="hidden sm:inline">BRANDING SPECIFICATION</span>
                                            <span className="sm:hidden">BRANDING SPEC</span>
                                        </h1>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span>Date: {new Date().toLocaleDateString('en-ZA')}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                                                <span className="truncate">Product: {productName}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <div className="bg-gray-100 px-3 sm:px-4 py-2 rounded">
                                            <p className="text-xs text-gray-500 mb-1">Order ID</p>
                                            <p className="font-mono text-xs sm:text-sm">BRD-{Date.now().toString().slice(-6)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Executive Summary */}
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 border-b border-gray-300 pb-2">ORDER SUMMARY</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm sm:text-base text-gray-600">Total Units:</span>
                                            <span className="text-sm sm:text-base font-semibold">{totalQuantity}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm sm:text-base text-gray-600">Colors Selected:</span>
                                            <span className="text-sm sm:text-base font-semibold">{selectedColors.length}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm sm:text-base text-gray-600">Branding Positions:</span>
                                            <span className="text-sm sm:text-base font-semibold">{totalPositions}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm sm:text-base text-gray-600">Artwork Files:</span>
                                            <span className="text-sm sm:text-base font-semibold">{totalArtworkFiles}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm sm:text-base text-gray-600">Base Price:</span>
                                            <span className="text-sm sm:text-base font-semibold">R {(totalCost.basePrice || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm sm:text-base text-gray-600">Branding Cost:</span>
                                            <span className="text-sm sm:text-base font-semibold">R {(totalCost.brandingCost || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-sm sm:text-base text-gray-600">Setup Fees:</span>
                                            <span className="text-sm sm:text-base font-semibold">R {(totalCost.setupFees || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b-2 border-gray-800 font-bold text-base sm:text-lg">
                                            <span>TOTAL:</span>
                                            <span>R {(totalCost.grandTotal || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Color Selection */}
                            {selectedColors.length > 0 && (
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <div className="w-2 h-4 sm:h-6 bg-blue-600 rounded"></div>
                                        <span className="text-sm sm:text-base">SELECTED COLORS & QUANTITIES</span>
                                    </h3>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Mobile view - stacked cards */}
                                        <div className="block sm:hidden">
                                            {selectedColors.map((color, index) => (
                                                <div key={color?.colorCode || index} className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 last:border-b-0`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-4 h-4 rounded border border-gray-300"
                                                                style={{ backgroundColor: color?.colorCode || '#ccc' }}
                                                            ></div>
                                                            <span className="font-medium text-sm">{color?.colorName || 'Unknown'}</span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{color?.colorCode || 'N/A'}</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-gray-500">Qty:</span>
                                                            <span className="ml-1 font-medium">{color?.quantity || 0}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Unit:</span>
                                                            <span className="ml-1 font-medium">R {(color?.unitPrice || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Total:</span>
                                                            <span className="ml-1 font-semibold">R {((color?.quantity || 0) * (color?.unitPrice || 0)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Desktop/Tablet view - table */}
                                        <table className="w-full hidden sm:table">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                                                    <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                                    <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                                    <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                                    <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {selectedColors.map((color, index) => (
                                                    <tr key={color?.colorCode || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-3 sm:px-4 py-3 text-sm font-medium text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                <div 
                                                                    className="w-4 h-4 rounded border border-gray-300"
                                                                    style={{ backgroundColor: color?.colorCode || '#ccc' }}
                                                                ></div>
                                                                <span className="truncate">{color?.colorName || 'Unknown'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-900">{color?.colorCode || 'N/A'}</td>
                                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 text-right">{color?.quantity || 0}</td>
                                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 text-right">R {(color?.unitPrice || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                                                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 text-right font-semibold">R {((color?.quantity || 0) * (color?.unitPrice || 0)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Branding Positions */}
                            {selectedPositions.length > 0 && (
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <div className="w-2 h-4 sm:h-6 bg-green-600 rounded"></div>
                                        <span className="text-sm sm:text-base">BRANDING POSITIONS</span>
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedPositions.map((position) => {
                                            const config = configurations.find(c => c?.positionId === position?.id);
                                            return (
                                                <div key={position?.id || Math.random()} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                                                        <h4 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                                                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="truncate">{position?.name || 'Unknown'} ({position?.code || 'N/A'})</span>
                                                        </h4>
                                                        <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded self-start sm:self-auto">
                                                            {position?.selectedMethod?.brandingName || 'No method selected'}
                                                        </span>
                                                    </div>
                                                    
                                                    {config && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                                            <div className="space-y-1">
                                                                <p><strong>Logo Name:</strong> <span className="break-words">{config.logoName || 'Not specified'}</span></p>
                                                                <p><strong>Dimensions:</strong> {config.width && config.height ? `${config.width} x ${config.height}` : 'Not specified'}</p>
                                                                <p><strong>Position:</strong> <span className="break-words">{config.positionInBrandingArea || 'Not specified'}</span></p>
                                                                <p><strong>Artwork Option:</strong> {config.artworkOption || 'upload'}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p><strong>Applied to Colors:</strong> {config.appliedColors?.length || 0} color(s)</p>
                                                                <p><strong>Color Type:</strong> <span className="break-words">{config.artworkColorType || 'Not specified'}</span></p>
                                                                <p><strong>Pantone Colors:</strong> {config.pantoneColors?.length || 0}</p>
                                                                {config.artworkFile && (
                                                                    <p className="flex items-center gap-1">
                                                                        <Upload className="w-3 h-3" />
                                                                        <strong>Artwork:</strong> <span className="truncate">{config.artworkFile.name}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Additional method details */}
                                                    {position?.selectedMethod && (
                                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                                <p><strong>Department:</strong> <span className="break-words">{position.selectedMethod.brandingDepartment}</span></p>
                                                                <p><strong>Max Size:</strong> {position.selectedMethod.maxPrintingSizeWidth} x {position.selectedMethod.maxPrintingSizeHeight}mm</p>
                                                                <p><strong>Colors:</strong> {position.selectedMethod.numberOfColours}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {config?.instructions && (
                                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                                            <p className="text-xs sm:text-sm"><strong>Instructions:</strong> <span className="break-words">{config.instructions}</span></p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Artwork Files */}
                            {artworkFiles.length > 0 && (
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <div className="w-2 h-4 sm:h-6 bg-purple-600 rounded"></div>
                                        <span className="text-sm sm:text-base">ARTWORK FILES</span>
                                    </h3>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Mobile view - stacked cards */}
                                        <div className="block lg:hidden">
                                            {artworkFiles.map((file, index) => {
                                                const position = selectedPositions.find(p => p?.id === file?.positionId);
                                                return (
                                                    <div key={file?.id || index} className={`p-3 sm:p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 last:border-b-0`}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FileText className="w-4 h-4 text-gray-500" />
                                                            <span className="font-medium text-sm truncate">{file?.name || 'Unknown file'}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                            <div>
                                                                <span className="text-gray-500">Type:</span>
                                                                <span className="ml-1">{file?.type || 'Unknown'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Size:</span>
                                                                <span className="ml-1">{file?.size || 'Unknown'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Date:</span>
                                                                <span className="ml-1">{file?.uploadDate || 'Unknown'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Position:</span>
                                                                <span className="ml-1 truncate">{position?.name || 'Unknown'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Desktop view - table */}
                                        <table className="w-full hidden lg:table">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {artworkFiles.map((file, index) => {
                                                    const position = selectedPositions.find(p => p?.id === file?.positionId);
                                                    return (
                                                        <tr key={file?.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                                                                <FileText className="w-4 h-4" />
                                                                <span className="truncate">{file?.name || 'Unknown file'}</span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">{file?.type || 'Unknown'}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">{file?.size || 'Unknown'}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">{file?.uploadDate || 'Unknown'}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-900 truncate">{position?.name || 'Unknown'}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Design Service Requests */}
                            {configurations.some(config => config?.artworkOption === 'design') && (
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <div className="w-2 h-4 sm:h-6 bg-orange-600 rounded"></div>
                                        <span className="text-sm sm:text-base">DESIGN SERVICE REQUESTS</span>
                                    </h3>
                                    <div className="space-y-4">
                                        {configurations
                                            .filter(config => config?.artworkOption === 'design')
                                            .map((config) => {
                                                const position = selectedPositions.find(p => p?.id === config?.positionId);
                                                return (
                                                    <div key={config?.positionId || Math.random()} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
                                                            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="truncate">Design for {position?.name || 'Unknown Position'}</span>
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                                            <div className="space-y-1">
                                                                <p><strong>Company Name:</strong> <span className="break-words">{config?.companyName || 'Not provided'}</span></p>
                                                                <p><strong>Industry:</strong> <span className="break-words">{config?.industry || 'Not specified'}</span></p>
                                                                <p><strong>Preferred Colors:</strong> <span className="break-words">{config?.preferredColors || 'Not specified'}</span></p>
                                                            </div>
                                                            <div>
                                                                {config?.designBrief && (
                                                                    <p><strong>Design Brief:</strong> <span className="break-words">{config.designBrief}</span></p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {/* Pantone Color Specifications */}
                            {configurations.some(config => config?.pantoneColors?.length > 0) && (
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <div className="w-2 h-4 sm:h-6 bg-indigo-600 rounded"></div>
                                        <span className="text-sm sm:text-base">PANTONE COLOR SPECIFICATIONS</span>
                                    </h3>
                                    <div className="space-y-4">
                                        {configurations.map((config) => {
                                            if (!config?.pantoneColors?.length) return null;
                                            const position = selectedPositions.find(p => p?.id === config?.positionId);
                                            return (
                                                <div key={config?.positionId || Math.random()} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                                                    <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base truncate">
                                                        {position?.name || 'Unknown Position'}
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                                                        {config.pantoneColors.map((color, index) => (
                                                            <div key={color?.id || index} className="border border-gray-100 rounded p-2">
                                                                <p><strong>Pantone:</strong> <span className="break-words">{color?.pantoneCode || 'Not specified'}</span></p>
                                                                <p><strong>Exact:</strong> <span className="break-words">{color?.exactColor || 'Not specified'}</span></p>
                                                                <p><strong>Standard:</strong> <span className="break-words">{color?.standardColor || 'Not specified'}</span></p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Document Footer */}
                            <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t-2 border-gray-800">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm text-gray-600">
                                    <div>
                                        <p>Generated on: {new Date().toLocaleString('en-ZA')}</p>
                                        <p>System: Product Branding Management</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p>Page 1 of 1</p>
                                        <p className="text-xs">Confidential Document</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-100 border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-xs sm:text-sm text-gray-600">
                            <span className="block sm:inline">Preview of branding specifications for {totalQuantity} units</span>
                            <span className="block sm:inline sm:ml-1">across {totalPositions} position(s)</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                Close Preview
                            </button>
                            {onConfirm && (
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="px-4 sm:px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    <span className="hidden sm:inline">{isLoading ? 'Processing...' : 'Confirm & Proceed'}</span>
                                    <span className="sm:hidden">{isLoading ? 'Processing...' : 'Confirm'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
     </Modal>
    );
};

export default BrandingPreviewModal;