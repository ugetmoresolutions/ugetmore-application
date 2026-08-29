// services/product/product.service.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { IProduct, ICreateProduct, ProductStatus } from "@/types/product/products.type";
import { ProductRepository } from "@/repositories/product/product.repository";
import { IProductService, PRODUCT_SERVICE_TOKEN } from "@/interfaces/product/product.service.interface";

@Service({ id: PRODUCT_SERVICE_TOKEN })
export class ProductService implements IProductService {
  constructor(private productRepository: ProductRepository) {}

  public async createProduct(productData: ICreateProduct): Promise<IProduct> {
    try {
      // Check for duplicate SKU
      const existingSku = await this.productRepository.findBySku(productData.sku);
      if (existingSku) {
        throw new HttpException(409, `Product with SKU "${productData.sku}" already exists`);
      }

      // Validate quantities
      if (productData.minQuantity > productData.maxQuantity) {
        throw new HttpException(400, "Minimum quantity cannot be greater than maximum quantity");
      }

      if (productData.stockQuantity < 0) {
        throw new HttpException(400, "Stock quantity cannot be negative");
      }

      const createdProduct = await this.productRepository.createProduct(productData);
      return createdProduct;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error creating product');
    }
  }

  public async getProductById(productId: number): Promise<IProduct | null> {
    try {
      const product = await this.productRepository.getProductById(productId);
      if (!product) {
        throw new HttpException(404, `Product with ID: ${productId} not found`);
      }
      return product;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching product');
    }
  }

  public async updateProduct(productId: number, updateData: Partial<IProduct>): Promise<IProduct | null> {
    try {
      const existingProduct = await this.productRepository.getProductById(productId);
      if (!existingProduct) {
        throw new HttpException(404, 'Product not found');
      }

      // Check for SKU conflicts if SKU is being updated
      if (updateData.sku && updateData.sku !== existingProduct.sku) {
        const duplicateSku = await this.productRepository.findBySku(updateData.sku);
        if (duplicateSku) {
          throw new HttpException(409, `Product with SKU "${updateData.sku}" already exists`);
        }
      }

      // Validate quantities if updated
      if (updateData.minQuantity !== undefined || updateData.maxQuantity !== undefined) {
        const minQty = updateData.minQuantity ?? existingProduct.minQuantity;
        const maxQty = updateData.maxQuantity ?? existingProduct.maxQuantity;
        if (minQty > maxQty) {
          throw new HttpException(400, "Minimum quantity cannot be greater than maximum quantity");
        }
      }

      if (updateData.stockQuantity !== undefined && updateData.stockQuantity < 0) {
        throw new HttpException(400, "Stock quantity cannot be negative");
      }

      const updatedProduct = await this.productRepository.updateProduct(productId, updateData);
      if (!updatedProduct) {
        throw new HttpException(500, 'Failed to update product');
      }
      return updatedProduct;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error updating product');
    }
  }

  public async deleteProduct(productId: number): Promise<boolean> {
    try {
      const productExists = await this.productRepository.getProductById(productId);
      if (!productExists) {
        throw new HttpException(404, 'Product not found');
      }

      const deleteResult = await this.productRepository.deleteProduct(productId);
      if (!deleteResult) {
        throw new HttpException(500, 'Failed to delete product');
      }

      return deleteResult;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error deleting product');
    }
  }

  public async getProductBySku(sku: string): Promise<IProduct | null> {
  try {
    const product = await this.productRepository.findBySku(sku);
    if (!product) {
      throw new HttpException(404, `Product with SKU: ${sku} not found`);
    }
    return product;
  } catch (err) {
    if (err instanceof HttpException) throw err;
    throw new HttpException(500, err.message || 'Error fetching product by SKU');
  }
}

  public async getAllProducts(options?: { 
    page?: number; 
    pageSize?: number;
    category?: string;
    status?: ProductStatus;
  }): Promise<{ products: IProduct[]; totalCount: number; totalPages: number }> {
    try {
      const result = await this.productRepository.getAllProducts(options);
      
      const totalPages = Math.ceil(result.totalCount / (options?.pageSize || 10));
      
      return {
        products: result.products,
        totalCount: result.totalCount,
        totalPages
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching products');
    }
  }

  public async getProductsByCategory(category: string): Promise<IProduct[]> {
    try {
      const decodedCategory = decodeURIComponent(category);
      const products = await this.productRepository.findByCategory(decodedCategory);
      
      if (!products || products.length === 0) {
        throw new HttpException(404, `No products found in category ${decodedCategory}`);
      }
      
      return products;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching products by category');
    }
  }

  public async searchProducts(query: string): Promise<IProduct[]> {
    try {
      const products = await this.productRepository.searchProducts(query);
      return products;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error searching products');
    }
  }

  public async updateProductStatus(productId: number, status: ProductStatus): Promise<IProduct | null> {
    try {
      return await this.productRepository.updateProduct(productId, { status });
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error updating product status');
    }
  }
}