// interfaces/gradeStationery/gradeStationery.repository.interface.ts
import { 
    IGradeStationery, 
    ICreateGradeStationery, 
    IUpdateGradeStationery,
    IStationeryItem,
    
} from "@/types/gradeStationery/gradeStationery.interface";

export interface IGradeStationeryRepository {
  getStationeryByGrade(gradeId: number): Promise<IGradeStationery | null>;
  getStationeryById(id: number): Promise<IGradeStationery | null>;
  createStationery(stationeryData: ICreateGradeStationery): Promise<IGradeStationery>;
  updateStationery(id: number, stationeryData: IUpdateGradeStationery): Promise<IGradeStationery>;
  updateStationeryByGrade(gradeId: number, stationeryData: IUpdateGradeStationery): Promise<IGradeStationery>;
  deleteStationery(id: number): Promise<boolean>;
  addItemsToStationery(gradeId: number, items: IStationeryItem[]): Promise<IGradeStationery>;
  updateItemQuantity(gradeId: number, productCode: string, minQuantity: number): Promise<IGradeStationery>;
  removeItemFromStationery(gradeId: number, productCode: string): Promise<IGradeStationery>;
  clearStationery(gradeId: number): Promise<boolean>;
  updateFileUrl(gradeId: number, fileUrl: string | null): Promise<IGradeStationery>;
  getStationeryWithFile(gradeId: number): Promise<IGradeStationery | null>;
}