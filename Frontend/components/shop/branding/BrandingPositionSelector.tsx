import React from 'react';
import { Info } from 'lucide-react';
import { BrandingPosition } from '@/interfaces/branding/branding';

interface BrandingPositionSelectorProps {
    positions: BrandingPosition[];
    onPositionToggle: (positionId: string) => void;
}

export const BrandingPositionSelector: React.FC<BrandingPositionSelectorProps> = ({
    positions,
    onPositionToggle
}) => {
    return (
        <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-xs sm:text-sm font-bold">3</span>
                <span className="text-sm sm:text-base">Select your Branding option</span>
            </h4>
        
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-cyan-800">
                    Click on the required branding position/s. You can apply different branding to different colors.
                </p>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                {positions.map((position) => (
                    <button
                        key={position.id}
                        onClick={() => onPositionToggle(position.id)}
                        className={`p-3 sm:p-4 md:p-4 lg:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all duration-200 ${
                            position.selected
                                ? 'border-cyan-500 bg-cyan-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 text-sm sm:text-base truncate pr-2">
                                <span className="block sm:hidden">{position.code}</span>
                                <span className="hidden sm:block">{position.code}: {position.name}</span>
                            </span>
                            {position.selected && (
                                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                                </div>
                            )}
                        </div>
                        <div className="block sm:hidden text-xs text-gray-600 mb-2 truncate">
                            {position.name}
                        </div>
                        {position.selectedMethod && (
                            <div className="text-xs sm:text-sm text-gray-600">
                                <div className="truncate">{position.selectedMethod.brandingName}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    <span className="hidden sm:inline">Max: </span>
                                    <span className="sm:hidden">Size: </span>
                                    {position.selectedMethod.maxPrintingSizeWidth} x {position.selectedMethod.maxPrintingSizeHeight}
                                </div>
                            </div>
                        )}
                        {position.selected && position.appliedToColors.length > 0 && (
                            <div className="text-xs text-cyan-600 mt-2">
                                <span className="hidden sm:inline">Applied to: </span>
                                <span className="sm:hidden">Colors: </span>
                                <span className="break-words">{position.appliedToColors.join(', ')}</span>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};