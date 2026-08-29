import React from 'react';
import { X } from 'lucide-react';

interface ColorChartProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    colors: Array<{ code: string; name: string; hex: string }>;
    onColorSelect: (colorCode: string) => void;
    description?: string;
}

export const ColorChart: React.FC<ColorChartProps> = ({
    isOpen,
    onClose,
    title,
    searchTerm,
    onSearchChange,
    colors,
    onColorSelect,
    description
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-xl max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-cyan-600">{title}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    {description && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{description}</p>
                    )}

                    <div className="mb-3 sm:mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
                            <label className="text-xs sm:text-sm font-medium">Search:</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Start typing here"
                                className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-1 sm:gap-2 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
                        {colors.map((color) => (
                            <button
                                key={color.code}
                                onClick={() => onColorSelect(color.code)}
                                className="flex flex-col items-center p-1 sm:p-2 border border-gray-200 rounded hover:border-cyan-500 hover:shadow-md transition-all group"
                                title={`${color.code} - ${color.name}`}
                            >
                                <div 
                                    className="w-full h-6 sm:h-8 rounded mb-0.5 sm:mb-1 border border-gray-300"
                                    style={{ backgroundColor: color.hex }}
                                ></div>
                                <span className="text-xs font-mono text-center leading-tight">{color.code}</span>
                            </button>
                        ))}
                    </div>

                    {colors.length === 0 && (
                        <div className="text-center text-gray-500 py-6 sm:py-8 text-sm">
                            No colors found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};