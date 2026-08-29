import { App } from "./app";
import { ProductAggregationRoute } from "./routes/aggregated-product/product-aggregation.route";
import { AuthRoute } from "./routes/auth/auth.routes";
import { BrandingProductRoute } from "./routes/brandingProduct/brandingProduct.route";
import { CartRoute } from "./routes/cart/cart.routes";
import { CategoryRoute } from "./routes/category/category.route";
import { EmailRoute } from "./routes/contact/contact.route";
import { CouponRoute } from "./routes/coupon/coupon.route";
import { FurnitureRoute } from "./routes/furniture/furniture.route";
import { GradeRoute } from "./routes/grade/grade.route";
import { GradeStationeryRoute } from "./routes/gradeStationery/gradeStationery.route";
import { NewsletterRoute } from "./routes/newsletter/newsletter.route";
// import { GradeStationeryRoute } from "./routes/gradeStationery/gradeStationery.route";
import { NotificationRoute } from "./routes/notification/notification.routes";
import { OrderRoute } from "./routes/order/order.routes";
import PFNotificationRoutes from "./routes/payment/notification.route";
import UnifiedPayFastRoutes from "./routes/payment/payfast.route";
import { ProductRoute } from "./routes/product/product.route";
import { SchoolRoute } from "./routes/school/school.route";
import { SoftwareInquiryRoute } from "./routes/softwareInquiry/softwareInquiry.route";
import { StockRoute } from "./routes/stock/stock.route";
import { SubCategoryRoute } from "./routes/subcategory/subcategory.route";
import { SupplierRoute } from "./routes/supplier/supplier.route";
import { SupplierProductRoute } from "./routes/supplierProduct/supplierProduct.route";
import { ValidateEnv } from "./utils/validateEnv";

ValidateEnv();

const app = new App([
  new AuthRoute(),
  new CartRoute(),
  new OrderRoute(),
  new NotificationRoute(),
  new PFNotificationRoutes(),
  new UnifiedPayFastRoutes(),
  new ProductRoute(),
  new EmailRoute(),
  new CategoryRoute(),
  new SubCategoryRoute(),
  new SupplierRoute(),
  new StockRoute(),
  new BrandingProductRoute(),
  new FurnitureRoute(),
  new SchoolRoute(),
  new GradeRoute(),
  new GradeStationeryRoute(),
  new SupplierProductRoute(),
  new CouponRoute(),
  new NewsletterRoute(),

  new ProductAggregationRoute(),
  new SoftwareInquiryRoute(),
]);

app.listen();
