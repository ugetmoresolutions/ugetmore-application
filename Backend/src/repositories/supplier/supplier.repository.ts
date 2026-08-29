// repositories/supplier/supplier.repository.ts
import { Service } from "typedi";
import { ISupplier, ICreateSupplier, IUpdateSupplier } from "@/types/supplier/supplier.type";
import Supplier from "@/models/supplier/supplier.model";
import { ISupplierRepository } from "@/interfaces/supplier/supplier.repository.interface";
import { HttpException } from "@/exceptions/HttpException";

@Service()
export class SupplierRepository implements ISupplierRepository {
  public async create(supplierData: ICreateSupplier): Promise<ISupplier> {
    try {
      return await Supplier.create(supplierData as any);
    } catch (error) {
      throw new HttpException(409, error.message);
    }
  }

  public async findAll(): Promise<ISupplier[]> {
    try {
      return await Supplier.findAll({
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async findByAccount(account: string): Promise<ISupplier | null> {
    try {
      return await Supplier.findOne({ 
        where: { account }
      });
    } catch (error) {
      throw new HttpException(404, error.message);
    }
  }

  public async findByName(name: string): Promise<ISupplier | null> {
    try {
      return await Supplier.findOne({ 
        where: { name }
      });
    } catch (error) {
      throw new HttpException(404, error.message);
    }
  }

  public async update(account: string, updateData: IUpdateSupplier): Promise<ISupplier | null> {
    try {
      const supplier = await Supplier.findOne({ where: { account } });
      if (!supplier) return null;

      await supplier.update(updateData as any);
      return supplier;
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }

  public async delete(account: string): Promise<boolean> {
    try {
      const deletedCount = await Supplier.destroy({
        where: { account }
      });
      return deletedCount === 1;
    } catch (error) {
      throw new HttpException(400, error.message);
    }
  }
}