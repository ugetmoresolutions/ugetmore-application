export interface ICategory {
  categoryName: string;
  categoryCode: string;
  categoryBehaviour: string; // looks like a string, e.g., "0"
  categoryPath: string;
  order: number;
  children: ICategory[]; // recursive for nested children
}


export interface ICategory {
  id?: number;
  name: string;
  code: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCategory {
  name: string;
  description?: string;
}

export interface IUpdateCategory {
  name?: string;
  description?: string;
}