import React from 'react';
import { Upload, X } from 'lucide-react';

interface ArtworkUploadProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: FileList | null) => void;
}

export const ArtworkUpload: React.FC<ArtworkUploadProps> = ({
    isOpen,
    onClose,
    onUpload
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-xl max-w-xs sm:max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold">
                            <span className="hidden sm:inline">Upload Artwork</span>
                            <span className="sm:hidden">Upload</span>
                        </h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 md:p-8 text-center">
                            <Upload className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 sm:mb-3 md:mb-4" />
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                <span className="hidden sm:inline">Drag and drop your files here, or click to browse</span>
                                <span className="sm:hidden">Tap to browse files</span>
                            </p>
                            <input
                                type="file"
                                onChange={(e) => onUpload(e.target.files)}
                                accept=".pdf,.ai,.eps,.svg,.png,.jpg,.jpeg,.cdr,.psd"
                                className="hidden"
                                id="artwork-upload"
                            />
                            <label
                                htmlFor="artwork-upload"
                                className="bg-cyan-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md sm:rounded-lg cursor-pointer hover:bg-cyan-600 transition-colors text-sm sm:text-base"
                            >
                                <span className="hidden sm:inline">Browse Files</span>
                                <span className="sm:hidden">Browse</span>
                            </label>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                            <p className="mb-2">
                                <span className="hidden sm:inline">Supported file types:</span>
                                <span className="sm:hidden">File types:</span>
                            </p>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                {['AI', 'CDR', 'EPS', 'PDF', 'PSD', 'SVG', 'JPEG', 'JPG'].map((type) => (
                                    <span key={type} className="bg-gray-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs">{type}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
