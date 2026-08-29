import { Model, DataTypes, Sequelize } from "sequelize";
import { IBrandingProduct } from "@/types/brandingProduct/brandingProduct.type";

class BrandingProduct
  extends Model<IBrandingProduct>
  implements IBrandingProduct
{
  public id!: number;
  public actionType!: number;
  public simpleCode!: string;
  public price!: number;
  public fullCode!: string;
  public categorisedAttribute!: any[];
  public gender!: string | null;
  public material!: string;
  public fit!: string;
  public feature!: string;
  public categories!: any[];
  public brand!: any;
  public companionCodes!: any[];
  public relatedCodes!: any[];
  public matchingCodes!: any[];
  public groupingCodes!: any[];
  public groupingCodeGiftsets!: any[];
  public productName!: string;
  public description!: string;
  public minimum!: number;
  public maximum!: number;
  public incrementedBy!: number;
  public keywords!: string;
  public tags!: string;
  public inventoryType!: string;
  public behaviour!: string;
  public madeToOrder!: string;
  public madeToOrderMessage!: string;
  public displayCountryOfOrigin!: string;
  public promotion!: string;
  public fullBrandingGuide!: string;
  public logo24BrandingGuide!: string | null;
  public images!: any[];
  public colourImages!: any[];
  public brandings!: any[];
  public isLogo24!: boolean;
  public logo24Branding!: any | null;
  public inclusiveBranding!: any[];
  public variants!: any[];
  public requiredBrandingPositions!: any[];
  public noCoBrandingPositions!: any[];
  public brandingTemplates!: any[];
  public decoupled!: boolean;
  public type!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    BrandingProduct.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        actionType: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        price: {
          type: DataTypes.DECIMAL(10, 2), 
          allowNull: true,
        },
        simpleCode: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        fullCode: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        categorisedAttribute: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("categorisedAttribute") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue(
              "categorisedAttribute",
              JSON.stringify(value) as any
            );
          },
        },
        gender: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        material: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        fit: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        feature: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        categories: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("categories") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue("categories", JSON.stringify(value) as any);
          },
        },
        brand: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("brand") as any;
            return rawValue ? JSON.parse(rawValue) : null;
          },
          set(value: any) {
            this.setDataValue("brand", JSON.stringify(value) as any);
          },
        },
        companionCodes: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("companionCodes") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue("companionCodes", JSON.stringify(value) as any);
          },
        },
        relatedCodes: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("relatedCodes") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue("relatedCodes", JSON.stringify(value) as any);
          },
        },
        matchingCodes: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("matchingCodes") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue("matchingCodes", JSON.stringify(value) as any);
          },
        },
        groupingCodes: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("groupingCodes") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue("groupingCodes", JSON.stringify(value) as any);
          },
        },
        groupingCodeGiftsets: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("groupingCodeGiftsets") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue(
              "groupingCodeGiftsets",
              JSON.stringify(value) as any
            );
          },
        },
        productName: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        minimum: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        maximum: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        incrementedBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        keywords: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        tags: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        inventoryType: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        behaviour: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        madeToOrder: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        madeToOrderMessage: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        displayCountryOfOrigin: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        promotion: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        fullBrandingGuide: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        logo24BrandingGuide: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        images: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("images") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue("images", JSON.stringify(value) as any);
          },
        },
        colourImages: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("colourImages") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue("colourImages", JSON.stringify(value) as any);
          },
        },
        brandings: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("brandings") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue("brandings", JSON.stringify(value) as any);
          },
        },
        isLogo24: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          
        },
        logo24Branding: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("logo24Branding") as any;
            return rawValue ? JSON.parse(rawValue) : null;
          },
          set(value: any) {
            this.setDataValue("logo24Branding", JSON.stringify(value) as any);
          },
        },
        inclusiveBranding: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("inclusiveBranding") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue(
              "inclusiveBranding",
              JSON.stringify(value) as any
            );
          },
        },
        variants: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("variants") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue("variants", JSON.stringify(value) as any);
          },
        },
        requiredBrandingPositions: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue(
              "requiredBrandingPositions"
            ) as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue(
              "requiredBrandingPositions",
              JSON.stringify(value) as any
            );
          },
        },
        noCoBrandingPositions: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("noCoBrandingPositions") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue(
              "noCoBrandingPositions",
              JSON.stringify(value) as any
            );
          },
        },
        brandingTemplates: {
          type: DataTypes.TEXT,
          allowNull: true,
          get() {
            const rawValue = this.getDataValue("brandingTemplates") as any;
            return rawValue ? JSON.parse(rawValue) : [];
          },
          set(value: any[]) {
            this.setDataValue(
              "brandingTemplates",
              JSON.stringify(value) as any
            );
          },
        },
        decoupled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          
        },
        type: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "BrandingProduct",
        tableName: "BrandingProducts",
        timestamps: true,
      }
    );
  }





}

export default BrandingProduct;
