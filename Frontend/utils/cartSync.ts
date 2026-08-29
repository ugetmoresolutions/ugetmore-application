import { CART_API } from "@/endpoints/rest-api/cart";
import { ICartItem, IAddCartItem } from "@/interfaces/cart/cart";

interface CartSyncResult {
  success: boolean;
  mergedItemsCount: number;
  errors: string[];
  message: string;
}

interface SyncOperationResult {
  success: boolean;
  action: string;
  item: ICartItem;
  error?: any;
  details?: string;
}

export class CartSyncService {
  private static getItemIdentifier(item: ICartItem): string {
    if (item.product?.fullCode) {
      return `product_${item.product.fullCode}`;
    }
    if (item.brandingConfigs && !item.product) {
      const firstColor = item.brandingConfigs.selectedColors?.[0];
      const firstPosition = item.brandingConfigs.selectedPositions?.[0];
      return `branded_${firstColor?.colorCode || 'unknown'}_${firstPosition?.id || 'unknown'}`;
    }
    return `item_${item.id}`;
  }

  private static getItemDisplayName(item: ICartItem): string {
    if (item.product?.productName) {
      return item.product.productName;
    }
    if (item.brandingConfigs) {
      const firstColor = item.brandingConfigs.selectedColors?.[0];
      return firstColor?.colorName ? `Custom Branded Product - ${firstColor.colorName}` : 'Custom Branded Product';
    }
    return 'Unknown Item';
  }

  private static areItemsEqual(item1: ICartItem, item2: ICartItem): boolean {
    const id1 = this.getItemIdentifier(item1);
    const id2 = this.getItemIdentifier(item2);
    return id1 === id2;
  }

  static async syncLocalCartToUserAccount(userId: number): Promise<CartSyncResult> {
    const result: CartSyncResult = {
      success: false,
      mergedItemsCount: 0,
      errors: [],
      message: ''
    };

    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        result.success = true;
        result.message = 'Server-side rendering: No local cart to sync';
        return result;
      }

      // Get localStorage cart items
      const localCartData = localStorage.getItem('cart');
      
      if (!localCartData) {
        result.success = true;
        result.message = 'No local cart items to sync';
        return result;
      }

      const localCartItems: ICartItem[] = JSON.parse(localCartData);
      
      if (!Array.isArray(localCartItems) || localCartItems.length === 0) {
        result.success = true;
        result.message = 'No valid local cart items to sync';
        this.clearLocalCart();
        return result;
      }

      console.log('Starting cart sync for user:', userId, 'with items:', localCartItems.length);

      // Get user's existing cart from API
      let existingUserCart: ICartItem[] = [];
      try {
        const userCartResponse = await CART_API.GET_USER_CART(userId);
        existingUserCart = userCartResponse?.data?.items || [];
        console.log('Existing user cart items:', existingUserCart.length);
      } catch (error) {
        console.log('No existing user cart found, will create new one');
        existingUserCart = [];
      }

      // Process each local cart item sequentially to avoid race conditions
      const syncResults: SyncOperationResult[] = [];
      
      for (const localItem of localCartItems) {
        try {
          console.log('Processing item:', this.getItemDisplayName(localItem));
          
          // Upload artwork files first if this is a branded item
          let processedItem = localItem;
          if (localItem.brandingConfigs?.configurations) {
            try {
              processedItem = await this.uploadArtworkFilesForItem(localItem);
              console.log('Artwork files uploaded successfully');
            } catch (uploadError) {
              console.error('Failed to upload artwork files:', uploadError);
              syncResults.push({
                success: false,
                action: 'upload_failed',
                item: localItem,
                error: uploadError
              });
              continue; // Skip this item if upload fails
            }
          }

          // Check if item already exists in user's cart
          const existingItem = existingUserCart.find(userItem => 
            this.areItemsEqual(userItem, processedItem)
          );

          if (existingItem) {
            // Item exists, update quantity by merging
            const currentQuantity = existingItem.quantity || 1;
            const localQuantity = processedItem.quantity || 1;
            const newQuantity = currentQuantity + localQuantity;
            
            try {
              await CART_API.UPDATE_ITEM_QUANTITY({
                userId: userId,
                itemId: existingItem.id,
                quantity: newQuantity
              });
              console.log('Quantity updated successfully');
              syncResults.push({
                success: true,
                action: 'updated',
                item: processedItem,
                details: `Quantity updated from ${currentQuantity} to ${newQuantity}`
              });
            } catch (updateError) {
              console.error('Failed to update item quantity:', updateError);
              syncResults.push({
                success: false,
                action: 'update_failed',
                item: processedItem,
                error: updateError
              });
            }
          } else {
            // Item doesn't exist, add it to user's cart
            const addCartData: IAddCartItem = {
              userId: userId,
              item: {
                ...processedItem,
                quantity: processedItem.quantity || 1,
                addedAt: new Date().toISOString()
              }
            };

            try {
              await CART_API.ADD_CART_ITEM(addCartData);
              console.log('Item added successfully');
              syncResults.push({
                success: true,
                action: 'added',
                item: processedItem,
                details: 'Added to cart'
              });
            } catch (addError) {
              console.error('Failed to add item to cart:', addError);
              syncResults.push({
                success: false,
                action: 'add_failed',
                item: processedItem,
                error: addError
              });
            }
          }
        } catch (error) {
          console.error('Error processing cart item:', error);
          syncResults.push({
            success: false,
            action: 'process_failed',
            item: localItem,
            error
          });
        }
      }

      // Process results
      const successfulSyncs = syncResults.filter(result => result.success);
      const failedSyncs = syncResults.filter(result => !result.success);

      result.mergedItemsCount = successfulSyncs.length;
      result.errors = failedSyncs.map(failed => {
        const actionText = failed.action === 'upload_failed' ? 'upload files for' : failed.action;
        return `Failed to ${actionText} item: ${this.getItemDisplayName(failed.item)}`;
      });

      if (successfulSyncs.length > 0) {
        result.success = true;
        
        if (failedSyncs.length === 0) {
          result.message = `Successfully synced ${successfulSyncs.length} item(s) to your cart`;
          // Clear localStorage only if all items were successfully synced
          this.clearLocalCart();
        } else {
          result.message = `Synced ${successfulSyncs.length} item(s), ${failedSyncs.length} failed`;
          // Partially clear localStorage - remove only successfully synced items
          this.clearSyncedItems(localCartItems, successfulSyncs);
        }
      } else {
        result.success = false;
        result.message = 'Failed to sync cart items';
      }

      console.log('Cart sync completed:', result);

      // Trigger cart count update
      this.triggerCartUpdate();

      return result;

    } catch (error) {
      console.error('Cart sync error:', error);
      result.success = false;
      result.message = 'An error occurred while syncing your cart';
      result.errors.push('Unexpected error during cart synchronization');
      return result;
    }
  }

  private static async uploadArtworkFilesForItem(item: ICartItem): Promise<ICartItem> {
    if (!item.brandingConfigs?.configurations) {
      return item;
    }

    const updatedConfigurations = [...item.brandingConfigs.configurations];
    let updatedArtworkFiles = item.brandingConfigs.artworkFiles ? [...item.brandingConfigs.artworkFiles] : [];
    let hasUploads = false;

    for (let i = 0; i < updatedConfigurations.length; i++) {
      const config = updatedConfigurations[i];
      
      // Check if this config has an artwork file with blob URL that needs uploading
      if (config.artworkFile && config.artworkFile.url.startsWith('blob:')) {
        try {
          // Convert blob URL to file for upload
          const response = await fetch(config.artworkFile.url);
          const blob = await response.blob();
          const file = new File([blob], config.artworkFile.name, { type: config.artworkFile.type });
          
          // Create FormData and upload
          const formData = new FormData();
          formData.append('files', file);
          
          const uploadResponse = await CART_API.UPLOAD_FILE(formData);
          
          if (uploadResponse?.data && uploadResponse.data.length > 0) {
            const uploadedFile = uploadResponse.data[0];
            
            // Update the config with uploaded file info
            updatedConfigurations[i] = {
              ...config,
              artworkFile: {
                ...config.artworkFile,
                url: uploadedFile.url,
                publicId: uploadedFile.publicId
              }
            };
            
            // Also update the artworkFiles array
            const artworkFileIndex = updatedArtworkFiles.findIndex(art => art.id === config.artworkFile?.id);
            if (artworkFileIndex !== -1) {
              updatedArtworkFiles[artworkFileIndex] = {
                ...updatedArtworkFiles[artworkFileIndex],
                url: uploadedFile.url,
                publicId: uploadedFile.publicId
              };
            }
            
            hasUploads = true;
            console.log('Uploaded artwork file during sync:', uploadedFile.url);
          } else {
            throw new Error(`No upload response received for file: ${config.artworkFile.name}`);
          }
        } catch (error) {
          console.error('Error uploading artwork file during sync:', error);
          throw new Error(`Failed to upload artwork file: ${config.artworkFile.name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Return updated item if there were uploads, otherwise return original
    if (hasUploads) {
      return {
        ...item,
        brandingConfigs: {
          ...item.brandingConfigs,
          configurations: updatedConfigurations,
          artworkFiles: updatedArtworkFiles
        }
      };
    }

    return item;
  }

  private static clearLocalCart(): void {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      localStorage.removeItem('cart');
      this.triggerCartUpdate();
    } catch (error) {
      console.error('Error clearing local cart:', error);
    }
  }

  private static clearSyncedItems(originalItems: ICartItem[], successfulSyncs: SyncOperationResult[]): void {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      
      const syncedItemIdentifiers = successfulSyncs.map(sync => 
        this.getItemIdentifier(sync.item)
      );
      
      const remainingItems = originalItems.filter(
        item => !syncedItemIdentifiers.includes(this.getItemIdentifier(item))
      );
      
      if (remainingItems.length > 0) {
        localStorage.setItem('cart', JSON.stringify(remainingItems));
        console.log('Remaining items in local cart:', remainingItems.length);
      } else {
        localStorage.removeItem('cart');
        console.log('All items synced, local cart cleared');
      }
      
      this.triggerCartUpdate();
    } catch (error) {
      console.error('Error clearing synced items:', error);
    }
  }

  private static triggerCartUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }

  static getLocalCartCount(): number {
    try {
      if (typeof window === 'undefined') {
        return 0;
      }
      const localCartData = localStorage.getItem('cart');
      if (!localCartData) return 0;
      const localCartItems: ICartItem[] = JSON.parse(localCartData);
      if (!Array.isArray(localCartItems)) return 0;
      return localCartItems.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        return sum + quantity;
      }, 0);
    } catch {
      return 0;
    }
  }

  static hasLocalCartItems(): boolean {
    try {
      if (typeof window === 'undefined') {
        return false;
      }
      const localCartData = localStorage.getItem('cart');
      if (!localCartData) return false;
      const localCartItems: ICartItem[] = JSON.parse(localCartData);
      return Array.isArray(localCartItems) && localCartItems.length > 0;
    } catch {
      return false;
    }
  }

  static async manualSync(userId: number): Promise<CartSyncResult> {
    return await this.syncLocalCartToUserAccount(userId);
  }
}

export const {
  syncLocalCartToUserAccount,
  getLocalCartCount,
  hasLocalCartItems,
  manualSync
} = CartSyncService;