import { DataTypes, Model } from 'sequelize';
import { Sequelize } from 'sequelize';
import User from './user.model';

class RefreshToken extends Model {
  public id!: number;
  public token!: string;
  public userId!: number;
  public expiresAt!: Date;

  static initialize(sequelize: Sequelize) {
    RefreshToken.init(
      {
        token: { type: DataTypes.STRING, primaryKey: true },
        userId: { type: DataTypes.INTEGER },
        expiresAt: { type: DataTypes.DATE }
      },
      { sequelize, modelName: 'RefreshToken', tableName: 'refresh_tokens' }
    );
    
    // Add this association
    RefreshToken.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
}

export default RefreshToken;