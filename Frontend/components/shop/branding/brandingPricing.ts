// utils/brandingPricing.ts
import { IBrandingOption } from '@/interfaces/branding/branding';
import { BrandingPosition, ColorQuantity, BrandingConfig } from '@/interfaces/branding/branding';

export interface PricingBreakdown {
  basePrice: number;
  brandingCost: number;
  setupFees: number;
  designFees: number;
  grandTotal: number;
}

export interface ColorBrandingCost {
  perItemCost: number;
  setupFees: number;
  totalItemCost: number;
}

/**
 * Get branding price for a specific method and quantity
 */
export const getBrandingPrice = (
  brandingCode: string, 
  quantity: number, 
  brandingPrices: IBrandingOption[]
) => {
  console.log('getBrandingPrice called with:', { 
    brandingCode, 
    quantity, 
    brandingPricesLength: brandingPrices?.length,
    availableCodes: brandingPrices?.map(bp => bp.brandingCode)
  });
  
  // Return default pricing if no branding code or empty array
  if (!brandingCode || !brandingPrices || brandingPrices.length === 0) {
    console.log('Returning default pricing - no branding code or prices');
    return { setup: 225.00, price: 12.00 };
  }

  // First try exact match
  let brandingOption = brandingPrices.find(bp => bp.brandingCode === brandingCode);
  
  // If no exact match, try to find a similar branding method
  if (!brandingOption) {
    console.log('No exact match found for:', brandingCode);
    
    // Try to match by branding method name patterns
    const brandingCodeUpper = brandingCode.toUpperCase();
    
    if (brandingCodeUpper.includes('DTC') || brandingCodeUpper.includes('DIGITAL')) {
      brandingOption = brandingPrices.find(bp => 
        bp.brandingCode.includes('DTC') || bp.brandingMethod.toLowerCase().includes('digital')
      );
      console.log('Found digital transfer match:', brandingOption?.brandingCode);
    } else if (brandingCodeUpper.includes('STP') || brandingCodeUpper.includes('SILICONE')) {
      brandingOption = brandingPrices.find(bp => 
        bp.brandingCode.includes('STP') || bp.brandingMethod.toLowerCase().includes('silicone')
      );
      console.log('Found silicone match:', brandingOption?.brandingCode);
    } else if (brandingCodeUpper.includes('EM') || brandingCodeUpper.includes('EMBROIDERY')) {
      brandingOption = brandingPrices.find(bp => 
        bp.brandingCode.includes('EM') || bp.brandingMethod.toLowerCase().includes('embroidery')
      );
      console.log('Found embroidery match:', brandingOption?.brandingCode);
    }
    
    // If still no match, use the first available option as fallback
    if (!brandingOption && brandingPrices.length > 0) {
      brandingOption = brandingPrices[0];
      console.log('Using fallback option:', brandingOption?.brandingCode);
    }
  } else {
    console.log('Found exact match:', brandingOption.brandingCode);
  }
  
  if (!brandingOption || !brandingOption.data || brandingOption.data.length === 0) {
    console.log('Returning default pricing - branding option not found or no data');
    return { setup: 225.00, price: 12.00 };
  }

  // Find the appropriate pricing tier based on quantity
  const pricingTier = brandingOption.data
    .filter(tier => quantity >= tier.minQuantity && (tier.maxQuantity === -1 || quantity <= tier.maxQuantity))
    .sort((a, b) => b.minQuantity - a.minQuantity)[0]; // Get the highest applicable tier

  console.log('Available pricing tiers:', brandingOption.data);
  console.log('Selected pricing tier for quantity', quantity, ':', pricingTier);
  
  const result = pricingTier || { setup: 225.00, price: 12.00 };
  console.log('Final pricing result:', result);
  
  return result;
};

/**
 * Calculate branding cost for a specific color
 */
export const calculateBrandingCostForColor = (
  colorQuantity: ColorQuantity,
  selectedPositions: BrandingPosition[],
  product: any,
  brandingPrices: IBrandingOption[]
): ColorBrandingCost => {
  // Return zero costs if no data provided
  if (!colorQuantity || !selectedPositions || !product || !brandingPrices) {
    return {
      perItemCost: 0,
      setupFees: 0,
      totalItemCost: 0
    };
  }

  let totalBrandingPerItem = 0;

  selectedPositions.forEach(position => {
    // For products without colors, check for 'no-colors' marker or skip color check entirely
    const shouldApplyBranding = position && position.selected && position.selectedMethod && (
      (position.appliedToColors && position.appliedToColors.includes(colorQuantity.colorCode)) ||
      (position.appliedToColors && position.appliedToColors.includes('no-colors'))
    );
    
    if (shouldApplyBranding) {
      const brandingMethod = position.selectedMethod;
      if (brandingMethod && brandingMethod.brandingCode) {
        const pricing = getBrandingPrice(brandingMethod.brandingCode, colorQuantity.quantity || 1, brandingPrices);
        
        // Find the corresponding branding position from product data to get multipliers
        const productBranding = product.brandings?.find((b: any) => 
          b.positionCode === position.code && 
          b.method?.some((m: any) => m.brandingCode === brandingMethod.brandingCode)
        );
        
        const positionMultiplier = productBranding?.positionMultiplier || 1;
        const methodMultiplier = productBranding?.method?.find((m: any) => 
          m.brandingCode === brandingMethod.brandingCode
        )?.brandingMultiplier || 1;
        
        // Add per-item branding cost (multiplied by position and branding multipliers)
        const itemCost = (pricing.price || 0) * (positionMultiplier || 1) * (methodMultiplier || 1);
        
        // Ensure we don't add NaN values
        if (!isNaN(itemCost) && isFinite(itemCost)) {
          totalBrandingPerItem += itemCost;
        }
      }
    }
  });

  const quantity = colorQuantity.quantity || 1;
  const totalItemCost = totalBrandingPerItem * quantity;

  return {
    perItemCost: isNaN(totalBrandingPerItem) ? 0 : totalBrandingPerItem,
    setupFees: 0, // Setup fees are calculated at order level, not per color
    totalItemCost: isNaN(totalItemCost) ? 0 : totalItemCost
  };
};

/**
 * Calculate total order cost including all fees
 */
export const calculateTotalOrderCost = (
  selectedColors: ColorQuantity[],
  selectedPositions: BrandingPosition[],
  brandingConfigs: BrandingConfig[],
  product: any,
  brandingPrices: IBrandingOption[]
): PricingBreakdown => {
  console.log('calculateTotalOrderCost called with:', {
    selectedColorsLength: selectedColors?.length,
    selectedPositionsLength: selectedPositions?.length,
    brandingPricesLength: brandingPrices?.length,
    selectedPositions: selectedPositions?.filter(pos => pos.selected)
  });

  // For products without colors, use base product price
  if (!selectedColors || selectedColors.length === 0) {
    const basePrice = product?.price || product?.calculatedPrice || ((product?.minimum || 1) * 1.5);
    const quantity = product?.minimum || 1;
    const totalBasePrice = basePrice * quantity;
    
    // Still calculate branding costs and setup fees for products without colors
    let totalBrandingCost = 0;
    const allSetupFees = new Set<string>();
    
    // Calculate design fees (R250 per position that has design service selected)
    let designFees = 0;
    selectedPositions.filter(pos => pos.selected).forEach(position => {
      const config = brandingConfigs.find(c => c.positionId === position.id);
      if (config && (config as any)?.artworkOption === 'design') {
        designFees += 250;
      }
    });

    // Calculate branding cost and setup fees for each position
    selectedPositions.filter(pos => pos.selected).forEach(position => {
      if (position.selectedMethod?.brandingCode && brandingPrices) {
        const brandingOption = getBrandingPrice(
          position.selectedMethod.brandingCode,
          quantity,
          brandingPrices
        );
        
        console.log('Branding calculation for products without colors:', {
          positionName: position.name,
          brandingCode: position.selectedMethod.brandingCode,
          quantity: quantity,
          baseBrandingOption: brandingOption
        });
        
        // Find the corresponding branding position from product data to get multipliers
        const productBranding = product?.brandings?.find((b: any) => 
          b.positionCode === position.code && 
          b.method?.some((m: any) => m.brandingCode === position.selectedMethod?.brandingCode)
        );
        
        const positionMultiplier = productBranding?.positionMultiplier || 1;
        const methodMultiplier = productBranding?.method?.find((m: any) => 
          m.brandingCode === position.selectedMethod?.brandingCode
        )?.brandingMultiplier || 1;
        
        console.log('Multipliers found:', {
          productBranding: productBranding,
          positionMultiplier: positionMultiplier,
          methodMultiplier: methodMultiplier
        });
        
        // Apply position and method multipliers to branding cost
        const itemCost = (brandingOption.price || 0) * (positionMultiplier || 1) * (methodMultiplier || 1);
        totalBrandingCost += itemCost * quantity;
        
        // Apply multipliers to setup fee as well
        const setupFee = (brandingOption.setup || 0) * (positionMultiplier || 1) * (methodMultiplier || 1);
        allSetupFees.add(`${position.selectedMethod.brandingCode}_${setupFee}`);
        
        console.log('Final costs calculated:', {
          itemCost: itemCost,
          totalForThisPosition: itemCost * quantity,
          setupFee: setupFee,
          runningTotalBrandingCost: totalBrandingCost
        });
      }
    });
    
    const setupFees = Array.from(allSetupFees).reduce((sum, feeKey) => {
      const setupFee = parseFloat(feeKey.split('_')[1]);
      return sum + setupFee;
    }, 0);
    
    return {
      basePrice: totalBasePrice,
      brandingCost: totalBrandingCost,
      setupFees: setupFees,
      designFees: designFees,
      grandTotal: totalBasePrice + totalBrandingCost + setupFees + designFees
    };
  }

  let totalBasePrice = 0;
  let totalBrandingCost = 0;
  const allSetupFees = new Set<string>();

  // Calculate design fees (R250 per position that has design service selected)
  const designFees = brandingConfigs?.reduce((sum, config) => {
    const artworkOption = (config as any)?.artworkOption;
    return sum + (artworkOption === 'design' ? 250 : 0);
  }, 0) || 0;

  // Calculate total quantity across all selected colors
  const totalQuantity = selectedColors.reduce((sum, cq) => sum + (cq?.quantity || 0), 0);
  console.log('Total quantity:', totalQuantity);

  selectedColors.forEach(colorQty => {
    if (!colorQty) return;
    
    console.log('Processing color:', colorQty.colorCode, 'quantity:', colorQty.quantity);
    
    // Base product cost
    const unitPrice = colorQty.unitPrice || 0;
    const quantity = colorQty.quantity || 0;
    const basePrice = unitPrice * quantity;
    
    if (!isNaN(basePrice) && isFinite(basePrice)) {
      totalBasePrice += basePrice;
    }
    
    // Branding costs
    const brandingCost = calculateBrandingCostForColor(colorQty, selectedPositions || [], product, brandingPrices || []);
    if (!isNaN(brandingCost.totalItemCost) && isFinite(brandingCost.totalItemCost)) {
      totalBrandingCost += brandingCost.totalItemCost;
    }
    
    // Track setup fees (one-time per branding method across all colors) - BACK TO ORIGINAL LOGIC
    if (selectedPositions) {
      selectedPositions.forEach(position => {
        if (position && position.selected && position.appliedToColors && position.appliedToColors.includes(colorQty.colorCode)) {
          console.log('Position applies to color:', position.name, 'method:', position.selectedMethod?.brandingName);
          
          const brandingMethod = position.selectedMethod;
          if (brandingMethod && brandingMethod.brandingCode) {
            console.log('Getting pricing for branding code:', brandingMethod.brandingCode);
            
            const pricing = getBrandingPrice(brandingMethod.brandingCode, totalQuantity, brandingPrices || []);
            console.log('Pricing object received:', pricing);
            
            const setupFee = pricing.setup;
            console.log('Raw setup fee from pricing object:', setupFee, 'type:', typeof setupFee);
            
            if (setupFee && !isNaN(setupFee) && isFinite(setupFee) && setupFee > 0) {
              const feeKey = `${brandingMethod.brandingCode}:${setupFee}`;
              console.log('Adding setup fee key (new format):', feeKey);
              allSetupFees.add(feeKey);
            } else {
              console.log('Setup fee not added - invalid value:', setupFee);
            }
          }
        }
      });
    }
  });

  console.log('All setup fees set:', Array.from(allSetupFees));

  const totalSetupFees = Array.from(allSetupFees).reduce((sum, feeString) => {
    console.log('Processing setup fee string:', feeString);
    
    // Changed delimiter from '-' to ':' to avoid conflicts with negative numbers
    const parts = feeString.split(':');
    if (parts.length >= 2) {
      const setupFeeStr = parts[1];
      const setup = parseFloat(setupFeeStr);
      console.log('Extracted setup fee:', setupFeeStr, '-> parsed:', setup);
      
      if (!isNaN(setup) && isFinite(setup)) {
        console.log('Adding setup fee to total:', setup);
        return sum + setup;
      } else {
        console.log('Invalid setup fee, skipping:', setup);
        return sum;
      }
    } else {
      console.log('Invalid fee string format:', feeString);
      return sum;
    }
  }, 0);

  console.log('Total setup fees:', totalSetupFees);

  const grandTotal = totalBasePrice + totalBrandingCost + totalSetupFees + designFees;

  const result = {
    basePrice: isNaN(totalBasePrice) ? 0 : totalBasePrice,
    brandingCost: isNaN(totalBrandingCost) ? 0 : totalBrandingCost,
    setupFees: isNaN(totalSetupFees) ? 0 : totalSetupFees,
    designFees: isNaN(designFees) ? 0 : designFees,
    grandTotal: isNaN(grandTotal) ? 0 : grandTotal
  };

  console.log('Final pricing result:', result);
  return result;
};

/**
 * Get price per item including all costs
 */
export const getPricePerItem = (
  colorQuantity: ColorQuantity,
  selectedPositions: BrandingPosition[],
  product: any,
  brandingPrices: IBrandingOption[]
): number => {
  if (!colorQuantity) return 0;
  
  const brandingCost = calculateBrandingCostForColor(colorQuantity, selectedPositions || [], product, brandingPrices || []);
  const basePrice = colorQuantity.unitPrice || 0;
  const totalPrice = basePrice + brandingCost.perItemCost;
  
  return isNaN(totalPrice) ? basePrice : totalPrice;
};