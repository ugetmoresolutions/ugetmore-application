// types/grade/grade.interface.ts
export interface IGrade {
    id: number;
    schoolId: number;
    gradeName: string;
    gradeLevel: number;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICreateGrade extends Omit<IGrade, 'id' | 'createdAt' | 'updatedAt'> {}

export interface IUpdateGrade {
    gradeName?: string;
    gradeLevel?: number;
    description?: string;
    isActive?: boolean;
}

export interface IGradeWithSchool extends IGrade {
    school: {
        id: number;
        name: string;
        code: string;
    };
}