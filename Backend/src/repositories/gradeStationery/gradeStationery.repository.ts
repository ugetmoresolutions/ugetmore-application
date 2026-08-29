// repositories/gradeStationery/gradeStationery.repository.ts
import { Service } from "typedi";
import { HttpException } from "@/exceptions/HttpException";
import { IGradeStationeryRepository } from "@/interfaces/gradeStationery/gradeStationery.repository.interface";
import { 
    IGradeStationery, 
    ICreateGradeStationery, 
    IUpdateGradeStationery,
    IStationeryItem
} from "@/types/gradeStationery/gradeStationery.interface";
import GradeStationery from "@/models/gradeStationery/gradeStationery.model";
import Grade from "@/models/grade/grade.model";
import { Op } from "sequelize";

@Service()
export class GradeStationeryRepository implements IGradeStationeryRepository {
  
  public async getStationeryByGrade(gradeId: number): Promise<IGradeStationery | null> {
    try {
      const stationery = await GradeStationery.findOne({
        where: { gradeId }
      });
      return stationery ? stationery.toJSON() as IGradeStationery : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get grade stationery: ${error.message}`);
    }
  }

  public async getStationeryWithFile(gradeId: number): Promise<IGradeStationery | null> {
    try {
      const stationery = await GradeStationery.findOne({
        where: { 
          gradeId,
          fileUrl: { [Op.not]: null } // Only return if file exists
        }
      });
      return stationery ? stationery.toJSON() as IGradeStationery : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get grade stationery with file: ${error.message}`);
    }
  }

  public async getStationeryById(id: number): Promise<IGradeStationery | null> {
    try {
      const stationery = await GradeStationery.findByPk(id);
      return stationery ? stationery.toJSON() as IGradeStationery : null;
    } catch (error: any) {
      throw new HttpException(500, `Failed to get grade stationery: ${error.message}`);
    }
  }

  public async createStationery(stationeryData: ICreateGradeStationery): Promise<IGradeStationery> {
    try {
      // Check if grade exists
      const grade = await Grade.findByPk(stationeryData.gradeId);
      if (!grade) {
        throw new HttpException(404, "Grade not found");
      }

      // Check if stationery already exists for this grade
      const existingStationery = await GradeStationery.findOne({
        where: { gradeId: stationeryData.gradeId }
      });

      if (existingStationery) {
        throw new HttpException(409, "Stationery already exists for this grade");
      }

      const stationery = await GradeStationery.create({
        ...stationeryData
      } as any);

      return stationery.toJSON() as IGradeStationery;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to create grade stationery: ${error.message}`);
    }
  }

  public async updateStationery(id: number, stationeryData: IUpdateGradeStationery): Promise<IGradeStationery> {
    try {
      const stationery = await GradeStationery.findByPk(id);
      if (!stationery) {
        throw new HttpException(404, "Grade stationery not found");
      }

      await stationery.update(stationeryData as any);
      return stationery.toJSON() as IGradeStationery;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update grade stationery: ${error.message}`);
    }
  }

  public async updateStationeryByGrade(gradeId: number, stationeryData: IUpdateGradeStationery): Promise<IGradeStationery> {
    try {
      const stationery = await GradeStationery.findOne({ where: { gradeId } });
      if (!stationery) {
        throw new HttpException(404, "Grade stationery not found");
      }

      await stationery.update(stationeryData as any);
      return stationery.toJSON() as IGradeStationery;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update grade stationery: ${error.message}`);
    }
  }

  public async deleteStationery(id: number): Promise<boolean> {
    try {
      const stationery = await GradeStationery.findByPk(id);
      if (!stationery) {
        throw new HttpException(404, "Grade stationery not found");
      }

      await stationery.destroy();
      return true;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to delete grade stationery: ${error.message}`);
    }
  }

  public async addItemsToStationery(gradeId: number, items: IStationeryItem[]): Promise<IGradeStationery> {
    try {
      let stationery = await GradeStationery.findOne({ where: { gradeId } });
      
      if (!stationery) {
        // Create new stationery if it doesn't exist
        stationery = await GradeStationery.create({
          gradeId,
          stationeryItems: items
        } as any);
      } else {
        // Add to existing stationery (update if exists, add if new)
        const currentItems = stationery.stationeryItems || [];
        const updatedItems = [...currentItems];
        
        for (const newItem of items) {
          const existingIndex = updatedItems.findIndex(item => item.productCode === newItem.productCode);
          if (existingIndex >= 0) {
            // Update existing item
            updatedItems[existingIndex] = newItem;
          } else {
            // Add new item
            updatedItems.push(newItem);
          }
        }
        
        await stationery.update({ stationeryItems: updatedItems } as any);
      }

      return stationery.toJSON() as IGradeStationery;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to add items to stationery: ${error.message}`);
    }
  }

  public async updateItemQuantity(gradeId: number, productCode: string, minQuantity: number): Promise<IGradeStationery> {
    try {
      const stationery = await GradeStationery.findOne({ where: { gradeId } });
      if (!stationery) {
        throw new HttpException(404, "Stationery not found for this grade");
      }

      const currentItems = stationery.stationeryItems || [];
      const itemIndex = currentItems.findIndex(item => item.productCode === productCode);
      
      if (itemIndex === -1) {
        throw new HttpException(404, "Product code not found in stationery");
      }

      // Update the quantity
      currentItems[itemIndex].minQuantity = minQuantity;
      
      await stationery.update({ stationeryItems: currentItems } as any);
      return stationery.toJSON() as IGradeStationery;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update item quantity: ${error.message}`);
    }
  }

  public async removeItemFromStationery(gradeId: number, productCode: string): Promise<IGradeStationery> {
    try {
      const stationery = await GradeStationery.findOne({ where: { gradeId } });
      if (!stationery) {
        throw new HttpException(404, "Stationery not found for this grade");
      }

      const currentItems = stationery.stationeryItems || [];
      const updatedItems = currentItems.filter(item => item.productCode !== productCode);

      if (updatedItems.length === currentItems.length) {
        throw new HttpException(404, "Product code not found in stationery");
      }

      await stationery.update({ stationeryItems: updatedItems } as any);
      return stationery.toJSON() as IGradeStationery;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to remove item from stationery: ${error.message}`);
    }
  }

  public async clearStationery(gradeId: number): Promise<boolean> {
    try {
      const stationery = await GradeStationery.findOne({ where: { gradeId } });
      if (!stationery) {
        throw new HttpException(404, "Stationery not found for this grade");
      }

      await stationery.update({ stationeryItems: [] } as any);
      return true;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to clear stationery: ${error.message}`);
    }
  }

  public async updateFileUrl(gradeId: number, fileUrl: string | null): Promise<IGradeStationery> {
    try {
      let stationery = await GradeStationery.findOne({ where: { gradeId } });
      
      if (!stationery) {
        // Create new stationery if it doesn't exist
        stationery = await GradeStationery.create({
          gradeId,
          stationeryItems: [],
          fileUrl
        } as any);
      } else {
        // Update existing stationery
        await stationery.update({ fileUrl } as any);
      }

      return stationery.toJSON() as IGradeStationery;
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, `Failed to update file URL: ${error.message}`);
    }
  }
}