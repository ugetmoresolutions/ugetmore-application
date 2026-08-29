

export interface ColorQuantity {
    colorCode: string;
    colorName: string;
    quantity: number;
    unitPrice: number;
    images?: any[];
    selected: boolean;
}

export interface BrandingPosition {
    id: string;
    name: string;
    code: string;
    selected: boolean;
    methods: BrandingMethod[];
    selectedMethod?: BrandingMethod;
    appliedToColors: string[];
}
export interface BrandingMethod {
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
export interface ArtworkFile {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    url?: string;
    positionId?: string;
}

export interface BrandingConfig {
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
    
    // NEW PROPERTIES FOR DESIGN SERVICE:
    artworkOption?: 'upload' | 'previous' | 'design';
    designBrief?: string;
    companyName?: string;
    industry?: string;
    preferredColors?: string;
}



export interface IBrandingPrice {
  printCode: string;
  minQuantity: number;
  maxQuantity: number;
  numberOfColours: number;
  setup: number;
  price: number;
}

export interface IBrandingOption {
  brandingCode: string;
  brandingMethod: string;
  data: IBrandingPrice[];
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