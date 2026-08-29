import { ArtworkFile, BrandingConfig, ColorQuantity } from "@/interfaces/branding/branding";

// utils/brandingHelpers.ts (Helper utilities)
export const getPositionGridOptions = () => [
    'Top Left', 'Top Center', 'Top Right',
    'Middle Left', 'Center', 'Middle Right',
    'Bottom Left', 'Bottom Center', 'Bottom Right'
];

export const getEmbroideryPositions = () => [
    'Center', 'Left Chest', 'Right Chest', 'Full Front', 'Full Back'
];

export const calculateTotals = (colorQuantities: ColorQuantity[]) => {
    const selectedColors = colorQuantities.filter(cq => cq.selected);
    const totalQuantity = selectedColors.reduce((sum, cq) => sum + cq.quantity, 0);
    const totalValue = selectedColors.reduce((sum, cq) => sum + (cq.quantity * cq.unitPrice), 0);
    
    return { selectedColors, totalQuantity, totalValue };
};

export const createArtworkFile = (file: File, positionId: string): ArtworkFile => ({
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024).toFixed(1)} KB`,
    uploadDate: new Date().toLocaleDateString(),
    url: URL.createObjectURL(file),
    positionId
});

export const createInitialBrandingConfig = (positionId: string): BrandingConfig => ({
    positionId,
    logoName: '',
    width: '',
    height: '',
    instructions: '',
    appliedColors: [],
    positionInBrandingArea: '',
    embroideryPosition: '',
    artworkColorType: 'pantone',
    pantoneColors: [{
        id: crypto.randomUUID(),
        pantoneCode: '',
        exactColor: '',
        standardColor: '',
        selectedColor: ''
    }],
    brandingColors: ['']
});