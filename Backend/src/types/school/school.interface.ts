// types/school/school.interface.ts
export interface ISchool {
    id: number;
    name: string;
    code: string;
    type: 'preschool' | 'primary' | 'high' | 'combined'; // ADD 'combined' TYPE
    address?: string;
    imageUrl: string
    city?: string;
    province?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// For creating - omit auto-generated fields
export interface ICreateSchool extends Omit<ISchool, 'id' | 'createdAt' | 'updatedAt'> {}

// For updating - make all fields optional
export interface IUpdateSchool {
    name?: string;
    address?: string;
    city?: string;
    imageUrl: string
    province?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: boolean;
}