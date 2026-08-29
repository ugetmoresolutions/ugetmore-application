import { ArtworkFile, BrandingConfig, BrandingPosition, ColorQuantity } from '@/interfaces/branding/branding';
import { useState, useEffect } from 'react';

export const useBrandingState = (product: any) => {
    const [colorQuantities, setColorQuantities] = useState<ColorQuantity[]>([]);
    const [brandingPositions, setBrandingPositions] = useState<BrandingPosition[]>([]);
    const [brandingConfigs, setBrandingConfigs] = useState<BrandingConfig[]>([]);
    const [artworkFiles, setArtworkFiles] = useState<ArtworkFile[]>([]);

    // Initialize state from product data
    useEffect(() => {
        if (product.colourImages && product.colourImages.length > 0) {
            const basePrice = product.price || product.calculatedPrice || ((product.minimum || 1) * 1.5);
            const quantities = product.colourImages.map((colorImg: any) => ({
                colorCode: colorImg.code,
                colorName: colorImg.name,
                quantity: product.minimum || 1,
                unitPrice: basePrice,
                images: colorImg.images,
                selected: false
            }));
            setColorQuantities(quantities);
        }
    }, [product.colourImages, product.price, product.calculatedPrice, product.minimum]);

    useEffect(() => {
        if (product.brandings && product.brandings.length > 0) {
            const positions = product.brandings.map((branding: any, index: number) => ({
                id: `pos-${index}`,
                name: branding.positionName,
                code: branding.positionCode,
                selected: false,
                methods: branding.method || [],
                selectedMethod: branding.method?.[0],
                appliedToColors: []
            }));
            setBrandingPositions(positions);
        }
    }, [product.brandings]);

    return {
        colorQuantities,
        setColorQuantities,
        brandingPositions,
        setBrandingPositions,
        brandingConfigs,
        setBrandingConfigs,
        artworkFiles,
        setArtworkFiles
    };
};
