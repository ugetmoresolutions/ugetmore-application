import { IGrade } from "../grade/grade";

// interfaces/school/school.ts
export interface ISchool {
    id: number;
    name: string;
    code: string;
    type: 'preschool' | 'primary' | 'high' | 'combined'; // ADD THIS
    imageUrl: string
    address?: string;
    city?: string;
    province?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    // Add grades property if you need it
    grades?: IGrade[];
}

// For creating - omit auto-generated fields
export interface ICreateSchool extends Omit<ISchool, 'id' | 'createdAt' | 'updatedAt' | 'grades'> {}

// For updating - make all fields optional and include code
export interface IUpdateSchool {
    name?: string;
    code?: string; // Add this line
    address?: string;
        type: 'preschool' | 'primary' | 'high' | 'combined'; // ADD THIS
        imageUrl: string

    city?: string;
    province?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: boolean;
}