
// components/BrandingGuideModal.tsx
import React from 'react';
import { X, Eye, Download } from 'lucide-react';

interface BrandingGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    guideUrl: string;
}

export const BrandingGuideModal: React.FC<BrandingGuideModalProps> = ({
    isOpen,
    onClose,
    guideUrl
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-xl max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                            <span className="hidden sm:inline">Branding Guidelines</span>
                            <span className="sm:hidden">Guidelines</span>
                        </h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                        <iframe
                            src={guideUrl}
                            className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] border border-gray-300 rounded-md sm:rounded-lg"
                            title="Branding Guidelines"
                        />
                        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                            <a
                                href={guideUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-500 text-white rounded-md sm:rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                            >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">View Full Document</span>
                                <span className="xs:hidden">View</span>
                            </a>
                            <a
                                href={guideUrl}
                                download
                                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-green-500 text-white rounded-md sm:rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
                            >
                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden xs:inline">Download PDF</span>
                                <span className="xs:hidden">Download</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};