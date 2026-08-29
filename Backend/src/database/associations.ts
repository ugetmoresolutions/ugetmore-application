import User from "@/models/user/user.model";
import RefreshToken from "@/models/user/refreshToken.model";
import Cart from "@/models/cart/cart.model";
import Notification from "@/models/notification/notification.model";
import Order from "@/models/order/order.model";
import SubCategory from "@/models/subcategory/subcategory.model";
import Category from "@/models/category/category.model";
import Stock from "@/models/stock/stock.model";
import BrandingProduct from "@/models/brandingProduct/brandingProduct.model";
import Grade from "@/models/grade/grade.model";
import School from "@/models/school/school.model";
import GradeStationery from "@/models/gradeStationery/gradeStationery.model";
import Product from "@/models/product/product.model";

export function setupAssociations() {
  RefreshToken.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(RefreshToken, { foreignKey: "userId", onDelete: "CASCADE" });
  Cart.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(Cart, { foreignKey: "userId", onDelete: "CASCADE" });
  Notification.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
  User.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE" });
  // Order.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
  Order.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
    onDelete: "CASCADE",
  });
  User.hasMany(Order, { foreignKey: "userId", onDelete: "CASCADE" });

  Category.hasMany(SubCategory, {
    foreignKey: "categoryId",
    as: "subCategories",
    onDelete: "CASCADE",
  });

  SubCategory.belongsTo(Category, {
    foreignKey: "categoryId",
    as: "category",
    onDelete: "CASCADE",
  });

  BrandingProduct.hasOne(Stock, {
    foreignKey: "productId",
    as: "stock",
    onDelete: "CASCADE",
  });

  Stock.belongsTo(BrandingProduct, {
    foreignKey: "productId",
    as: "product",
    onDelete: "CASCADE",
  });

  School.hasMany(Grade, {
    foreignKey: "schoolId",
    as: "grades",
    onDelete: "CASCADE",
  });

  Grade.belongsTo(School, {
    foreignKey: "schoolId",
    as: "school",
    onDelete: "CASCADE",
  });


   // Grade - GradeStationery associations (simplified)
    Grade.hasOne(GradeStationery, {
        foreignKey: "gradeId",
        as: "stationery",
        onDelete: "CASCADE",
    });

    GradeStationery.belongsTo(Grade, {
        foreignKey: "gradeId",
        as: "grade",
        onDelete: "CASCADE",
    });

    
}
