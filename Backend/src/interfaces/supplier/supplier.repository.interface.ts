// interfaces/supplier/supplier.repository.interface.ts
import { ISupplier, ICreateSupplier, IUpdateSupplier } from "@/types/supplier/supplier.type";

export interface ISupplierRepository {
  create(supplierData: ICreateSupplier): Promise<ISupplier>;
  findAll(): Promise<ISupplier[]>;
  findByAccount(account: string): Promise<ISupplier | null>;
  findByName(name: string): Promise<ISupplier | null>;
  update(account: string, updateData: IUpdateSupplier): Promise<ISupplier | null>;
  delete(account: string): Promise<boolean>;
}