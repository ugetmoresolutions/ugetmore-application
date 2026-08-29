// interfaces/supplier/supplier.service.interface.ts
import { ISupplier, ICreateSupplier, IUpdateSupplier } from "@/types/supplier/supplier.type";
import { Token } from "typedi";

export interface ISupplierService {
  createSupplier(supplierData: ICreateSupplier): Promise<ISupplier>;
  getAllSuppliers(): Promise<ISupplier[]>;
  getSupplierByAccount(account: string): Promise<ISupplier | null>;
  updateSupplier(account: string, updateData: IUpdateSupplier): Promise<ISupplier | null>;
  deleteSupplier(account: string): Promise<boolean>;
}

export const SUPPLIER_SERVICE_TOKEN = new Token<ISupplierService>("ISupplierService");