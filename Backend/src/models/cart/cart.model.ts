import { Model, DataTypes, Sequelize } from "sequelize";
import { IUserCart, ICartItem } from "@/types/cart/cart.interface";

class Cart extends Model<IUserCart> implements IUserCart {
    public id!: number;
    public userId!: number;
    public items!: ICartItem[];
    public totalPrice!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: Sequelize) {
        Cart.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    unique: true,
                    references: {
                        model: "users",
                        key: "id"
                    }
                },
                items: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    get() {
                        const rawValue = this.getDataValue('items') as any;
                        return rawValue ? JSON.parse(rawValue) : [];
                    },
                    set(value: ICartItem[]) {
                        this.setDataValue('items', JSON.stringify(value) as any);
                    }
                },
                totalPrice: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: true
                }
            },
            {
                sequelize,
                modelName: "Cart",
                tableName: "Carts",
                timestamps: true
            }
        );
    }
}

export default Cart;