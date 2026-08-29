// models/newsletter/newsletter.model.ts
import { INewsletterSubscriber } from "@/types/newsletter/newsletter.type";
import { Model, DataTypes, Sequelize } from "sequelize";

class NewsletterSubscriber extends Model<INewsletterSubscriber> implements INewsletterSubscriber {
  public id!: number;
  public email!: string;
  public isActive!: boolean;
  public subscribedAt!: Date;
  public unsubscribedAt!: Date | null;
  public source!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    NewsletterSubscriber.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
          
          validate: {
            isEmail: true,
          },
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: true,
          
        },
        subscribedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          
        },
        unsubscribedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        source: {
          type: DataTypes.STRING(100),
          allowNull: true,
          
        },
      },
      {
        sequelize,
        modelName: "NewsletterSubscriber",
        tableName: "newsletter_subscribers",
        timestamps: true,
        
      }
    );
  }
}

export default NewsletterSubscriber;