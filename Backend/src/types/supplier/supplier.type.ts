// types/supplier/supplier.type.ts
export interface ISupplier {
  id?: number;
  name: string;
  account: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateSupplier {
  name: string;
  account: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface IUpdateSupplier {
  name?: string;
  account?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}