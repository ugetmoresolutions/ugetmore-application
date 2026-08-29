// services/supplier/supplier.service.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { ISupplier, ICreateSupplier, IUpdateSupplier } from "@/types/supplier/supplier.type";
import { SupplierRepository } from "@/repositories/supplier/supplier.repository";
import { ISupplierService, SUPPLIER_SERVICE_TOKEN } from "@/interfaces/supplier/supplier.service.interface";

@Service({ id: SUPPLIER_SERVICE_TOKEN })
export class SupplierService implements ISupplierService {
  constructor(private supplierRepository: SupplierRepository) {}

  public async createSupplier(supplierData: ICreateSupplier): Promise<ISupplier> {
    try {
      // Check for duplicate account
      const existingAccount = await this.supplierRepository.findByAccount(supplierData.account);
      if (existingAccount) {
        throw new HttpException(409, `Supplier with account "${supplierData.account}" already exists`);
      }

      // Check for duplicate name
      const existingName = await this.supplierRepository.findByName(supplierData.name);
      if (existingName) {
        throw new HttpException(409, `Supplier "${supplierData.name}" already exists`);
      }

      const createdSupplier = await this.supplierRepository.create(supplierData);
      return createdSupplier;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error creating supplier');
    }
  }

  public async getAllSuppliers(): Promise<ISupplier[]> {
    try {
      return await this.supplierRepository.findAll();
    } catch (err) {
      throw new HttpException(500, err.message || 'Error fetching suppliers');
    }
  }

  public async getSupplierByAccount(account: string): Promise<ISupplier | null> {
    try {
      const supplier = await this.supplierRepository.findByAccount(account);
      if (!supplier) {
        throw new HttpException(404, `Supplier with account: ${account} not found`);
      }
      return supplier;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error fetching supplier');
    }
  }

  public async updateSupplier(account: string, updateData: IUpdateSupplier): Promise<ISupplier | null> {
    try {
      const existingSupplier = await this.supplierRepository.findByAccount(account);
      if (!existingSupplier) {
        throw new HttpException(404, 'Supplier not found');
      }

      // Check for account conflicts if account is being updated
      if (updateData.account && updateData.account !== existingSupplier.account) {
        const duplicateAccount = await this.supplierRepository.findByAccount(updateData.account);
        if (duplicateAccount) {
          throw new HttpException(409, `Supplier with account "${updateData.account}" already exists`);
        }
      }

      // Check for name conflicts if name is being updated
      if (updateData.name && updateData.name !== existingSupplier.name) {
        const duplicateName = await this.supplierRepository.findByName(updateData.name);
        if (duplicateName) {
          throw new HttpException(409, `Supplier "${updateData.name}" already exists`);
        }
      }

      const updatedSupplier = await this.supplierRepository.update(account, updateData);
      if (!updatedSupplier) {
        throw new HttpException(500, 'Failed to update supplier');
      }
      return updatedSupplier;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error updating supplier');
    }
  }

  public async deleteSupplier(account: string): Promise<boolean> {
    try {
      const supplierExists = await this.supplierRepository.findByAccount(account);
      if (!supplierExists) {
        throw new HttpException(404, 'Supplier not found');
      }

      const deleteResult = await this.supplierRepository.delete(account);
      if (!deleteResult) {
        throw new HttpException(500, 'Failed to delete supplier');
      }

      return deleteResult;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException(500, err.message || 'Error deleting supplier');
    }
  }
}