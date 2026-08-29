import { Sequelize } from "sequelize";
import { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } from "../config";
import User from "../models/user/user.model";
import RefreshToken from "@/models/user/refreshToken.model";
import { setupAssociations } from "./associations";
import Cart from "@/models/cart/cart.model";
import Order from "@/models/order/order.model";
import Notification from "@/models/notification/notification.model";
import PFNotification from "@/models/notification/payfast.notification.model";
import Product from "@/models/product/product.model";
import Category from "@/models/category/category.model";
import SubCategory from "@/models/subcategory/subcategory.model";
import Supplier from "@/models/supplier/supplier.model";
import BrandingProduct from "@/models/brandingProduct/brandingProduct.model";
import Stock from "@/models/stock/stock.model";
import Grade from "@/models/grade/grade.model";
import GradeStationery from "@/models/gradeStationery/gradeStationery.model";
import School from "@/models/school/school.model";
import Coupon from "@/models/coupon/coupon.model";
import SupplierProduct from "@/models/supplierProduct/supplierProduct.model";
import NewsletterSubscriber from "@/models/newsletter/newsletter.model";
import SoftwareInquiry from "@/models/softwareInquiry/SoftwareInquiry.model";
import FurnitureProduct from "@/models/furniture/furniture.model";

const dbConnection = new Sequelize({
  dialect: "mssql",
  host: DB_HOST,
  port: 1433,
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  dialectOptions: {
    encrypt: true,
    trustServerCertificate: true,
    options: {
      requestTimeout: 30000,
    },
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

User.initialize(dbConnection);
RefreshToken.initialize(dbConnection);
SoftwareInquiry.initialize(dbConnection);
SupplierProduct.initialize(dbConnection);
FurnitureProduct.initialize(dbConnection);
Stock.initialize(dbConnection);
Grade.initialize(dbConnection);
GradeStationery.initialize(dbConnection);
School.initialize(dbConnection);
Coupon.initialize(dbConnection);
BrandingProduct.initialize(dbConnection);
Cart.initialize(dbConnection);
Order.initialize(dbConnection);
Product.initialize(dbConnection);
Notification.initialize(dbConnection);
PFNotification.initialize(dbConnection);
Category.initialize(dbConnection);
SubCategory.initialize(dbConnection);
Supplier.initialize(dbConnection);
NewsletterSubscriber.initialize(dbConnection);

setupAssociations();

dbConnection
  .sync({ alter: true })
  .then(() => console.log("Database synced successfully"))
  .catch((error) => console.error("Error syncing database:", error));

export default dbConnection;
