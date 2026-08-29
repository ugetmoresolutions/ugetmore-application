import "reflect-metadata";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { NODE_ENV, PORT, LOG_FORMAT, SECRET_KEY, FRONT_END_URL } from "@config";
import dbConnection from "./database";
import { ErrorMiddleware } from "./middlewares/ErrorMiddleware";
import { logger, stream } from "./utils/logger";
import Container from "typedi";
import { AUTH_SERVICE_TOKEN } from "./interfaces/auth/IAuthService.interface";
import { AuthService } from "./services/auth/auth.service";
import { AuthRepository } from "./repositories/auth/auth.repository";
import { Routes } from "./types/routes.interface";
import { FILE_UPLOAD_SERVICE_TOKEN } from "./interfaces/file-upload/file-upload.service.interface";
import { FileUploadService } from "./services/file-upload/file-upload.service";
import { apiGatewayMultipartMiddleware } from "./middlewares/apiGatewayMultipart";
import { CART_SERVICE_TOKEN } from "./interfaces/cart/cart.service.interface";
import { CartService } from "./services/cart/cart.service";
import { CartRepository } from "./repositories/cart/cart.repository";
import { UNIFIED_PAYFAST_SERVICE_TOKEN } from "./interfaces/payment/payment.service.interface";
import { UnifiedPayFastService } from "./services/payment/payment.service";
import { OrderService } from "./services/order/order.service";
import { ORDER_SERVICE_TOKEN } from "./interfaces/order/order.service.intreface";
import { OrderRepository } from "./repositories/order/order.repository";
import { NotificationService } from "./services/notification/notification.service";
import { PFNotificationRepository } from "./repositories/notification/payment.notification.repository";
import { NOTIFICATION_SERVICE_TOKEN } from "./interfaces/notification/notification.service.interface";
import { NotificationRepository } from "./repositories/notification/notification.repository";
import { PFNOTIFICATION_SERVICE_TOKEN } from "./interfaces/notification/payment/notification.repository.interface";
import { PFNotificationService } from "./services/notification/payment.notification.service";
import { OrderNotificationService } from "./services/order/orderNotification.service";
import { ORDER_NOTIFICATION_SERVICE_TOKEN } from "./interfaces/order/order.noification.service.interface";
import { PRODUCT_SERVICE_TOKEN } from "./interfaces/product/product.service.interface";
import { ProductService } from "./services/product/product.service";
import { ProductRepository } from "./repositories/product/product.repository";
import { CATEGORY_SERVICE_TOKEN } from "./interfaces/category/category.service.interface";
import { CategoryService } from "./services/category/category.service";
import { CategoryRepository } from "./repositories/category/category.repository";
import { SUB_CATEGORY_SERVICE_TOKEN } from "./interfaces/subcategory/subcategory.service.interface";
import { SubCategoryService } from "./services/subcategory/subcategory.service";
import { SubCategoryRepository } from "./repositories/subcategory/subcategory.repository";
import { SUPPLIER_SERVICE_TOKEN } from "./interfaces/supplier/supplier.service.interface";
import { SupplierService } from "./services/supplier/supplier.service";
import { SupplierRepository } from "./repositories/supplier/supplier.repository";
import { BRANDING_PRODUCT_SERVICE_TOKEN } from "./interfaces/brandingProduct/brandingProduct.interface.service";
import { BrandingProductService } from "./services/brandingProduct/brandingProduct.service";
import { BrandingProductRepository } from "./repositories/brandingProduct/brandingProduct.repository";
import { STOCK_SERVICE_TOKEN } from "./interfaces/stock/stock.service.interface";
import { StockService } from "./services/stock/stock.service";
import { StockRepository } from "./repositories/stock/stock.repository";
import { SCHOOL_SERVICE_TOKEN } from "./interfaces/school/school.service.interface";
import { SchoolService } from "./services/school/school.service";
import { SchoolRepository } from "./repositories/school/school.repository";
import { GRADE_SERVICE_TOKEN } from "./interfaces/grade/grade.service.interface";
import { GradeService } from "./services/grade/grade.service";
import { GradeRepository } from "./repositories/grade/grade.repository";
import { GRADE_STATIONERY_SERVICE_TOKEN } from "./interfaces/gradeStationery/gradeStationery.service.interface";
import { GradeStationeryService } from "./services/gradeStationery/gradeStationery.service";
import { GradeStationeryRepository } from "./repositories/gradeStationery/gradeStationery.repository";
import { AMROD_CONFIG_SERVICE_TOKEN } from "./interfaces/aggregated-product/amrod/amrod-config.service.interface";
import { AmrodConfigService } from "./services/aggregated-product/amrod/amrod-config.service";
import { AmrodClientService } from "./services/aggregated-product/amrod/amrod-client.service";
import { PRODUCT_AGGREGATION_SERVICE_TOKEN } from "./interfaces/aggregated-product/product/product-aggregation.service.interface";
import { ProductAggregationService } from "./services/aggregated-product/product-aggregation.service";
import { AMROD_CLIENT_SERVICE_TOKEN } from "./interfaces/aggregated-product/amrod/amrod-client.service.interface";
import { ParrotConfigService } from "./services/aggregated-product/parrot/parrot-config.service";
import { PARROT_CLIENT_SERVICE_TOKEN } from "./interfaces/aggregated-product/parrot/parrot-client.service.interface";
import { ParrotClientService } from "./services/aggregated-product/parrot/parrot-client.service";
import { COUPON_SERVICE_TOKEN } from "./interfaces/coupon/coupon.service.interface";
import { CouponService } from "./services/coupon/coupon.service";
import { CouponRepository } from "./repositories/coupon/coupon.repository";
import { TarsusConfigService } from "./services/aggregated-product/tarsus/tarsus-config.service";
import { TARSUS_CLIENT_SERVICE_TOKEN } from "./interfaces/aggregated-product/tarsus/tarsus-client.service.interface";
import { TarsusClientService } from "./services/aggregated-product/tarsus/tarsus-client.service";
import { SUPPLIER_PRODUCT_SERVICE_TOKEN } from "./interfaces/supplierProduct/supplierProduct.service.interface";
import { SupplierProductRepository } from "./repositories/supplierProduct/supplierProduct.repository";
import { SupplierProductService } from "./services/supplierProduct/supplierProduct.service";
import { AutomatedSupplierDataService } from "./services/supplierProduct/automated-supplier-data.service";
import { MidnightScheduler } from "./utils/midnight-scheduler";
import { NEWSLETTER_SERVICE_TOKEN } from "./interfaces/newsletter/newsletter.service.interface";
import { NewsletterRepository } from "./repositories/newsletter/newsletter.repository";
import { NewsletterService } from "./services/newsletter/newsletter.service";
import { SOFTWARE_INQUIRY_SERVICE_TOKEN } from "./interfaces/softwareInquiry/softwareInquiry.service.interface";
import { SoftwareInquiryService } from "./services/softwareInquiry/softwareInquiry.service";
import { SoftwareInquiryRepository } from "./repositories/softwareInquiry/softwareInquiry.repository";
import { FURNITURE_SERVICE_TOKEN } from "./interfaces/furniture/furniture.service.interface";
import { FurnitureService } from "./services/furniture/furniture.service";
import { FurnitureRepository } from "./repositories/furniture/furniture.repository";

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || "development";
    this.port = PORT || 5000;

    this.initializeInterfaces();
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.initializeUnhandledErrorHandling();
    // this.initializeScheduler();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 UGETMO listening on port ${this.port}`);
      logger.info(`==================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  public async connectToDatabase() {
    try {
      await dbConnection.authenticate();
      logger.info("Connected to the database successfully.");
    } catch (error) {
      logger.error("Unable to connect to the database:", error);
      process.exit(1);
    }
  }

  private corsOptions = {
    origin: [FRONT_END_URL, "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  };

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(cors(this.corsOptions));
    this.app.use(apiGatewayMultipartMiddleware);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser(SECRET_KEY));
    this.app.set("trust proxy", 1);
  }

  private initializeInterfaces() {
    Container.set(
      AUTH_SERVICE_TOKEN,
      new AuthService(Container.get(AuthRepository))
    );
    Container.set(
      CART_SERVICE_TOKEN,
      new CartService(
        Container.get(AuthRepository),
        Container.get(CartRepository),
        Container.get(COUPON_SERVICE_TOKEN)
      )
    );


     Container.set(
    FURNITURE_SERVICE_TOKEN,
    new FurnitureService(Container.get(FurnitureRepository))
  );

    Container.set(
      SOFTWARE_INQUIRY_SERVICE_TOKEN,
      new SoftwareInquiryService(Container.get(SoftwareInquiryRepository))
    );

    Container.set(
      COUPON_SERVICE_TOKEN,
      new CouponService(
        Container.get(CouponRepository),
        Container.get(AuthRepository),
        Container.get(PRODUCT_AGGREGATION_SERVICE_TOKEN) // Add this line
      )
    );

    Container.set(
      STOCK_SERVICE_TOKEN,
      new StockService(Container.get(StockRepository))
    );

    Container.set(
      NEWSLETTER_SERVICE_TOKEN,
      new NewsletterService(Container.get(NewsletterRepository))
    );

    Container.set(
      ORDER_SERVICE_TOKEN,
      new OrderService(
        Container.get(AuthRepository),
        Container.get(CartRepository),
        Container.get(OrderRepository),
        // Container.get(OrderNotificationService)
        Container.get(ORDER_NOTIFICATION_SERVICE_TOKEN)
      )
    );

    Container.set(
      PRODUCT_SERVICE_TOKEN,
      new ProductService(Container.get(ProductRepository))
    );

    Container.set(
      NOTIFICATION_SERVICE_TOKEN,
      new NotificationService(Container.get(NotificationRepository))
    );

    Container.set(
      CATEGORY_SERVICE_TOKEN,
      new CategoryService(Container.get(CategoryRepository))
    );

    Container.set(
      SUB_CATEGORY_SERVICE_TOKEN,
      new SubCategoryService(
        Container.get(SubCategoryRepository),
        
      )
    );

    Container.set(
      SUPPLIER_SERVICE_TOKEN,
      new SupplierService(Container.get(SupplierRepository))
    );

    Container.set(FILE_UPLOAD_SERVICE_TOKEN, new FileUploadService());

    // Add the new service
    Container.set(
      ORDER_NOTIFICATION_SERVICE_TOKEN,
      new OrderNotificationService(
        Container.get(NOTIFICATION_SERVICE_TOKEN),
        Container.get(AuthRepository)
      )
    );

    Container.set(
      PFNOTIFICATION_SERVICE_TOKEN,
      new PFNotificationService(Container.get(PFNotificationRepository))
    );

    Container.set(
      UNIFIED_PAYFAST_SERVICE_TOKEN,
      new UnifiedPayFastService(
        Container.get(ORDER_SERVICE_TOKEN),
        Container.get(CART_SERVICE_TOKEN),
        Container.get(NOTIFICATION_SERVICE_TOKEN),
        Container.get(AUTH_SERVICE_TOKEN),
        Container.get(PFNotificationRepository),
        Container.get(ORDER_NOTIFICATION_SERVICE_TOKEN),
        Container.get(COUPON_SERVICE_TOKEN)
      )
    );

    Container.set(
      BRANDING_PRODUCT_SERVICE_TOKEN,
      new BrandingProductService(Container.get(BrandingProductRepository))
    );

    // School Stationery Services
    Container.set(
      SCHOOL_SERVICE_TOKEN,
      new SchoolService(
        Container.get(SchoolRepository),
        Container.get(GradeRepository)
      )
    );

    Container.set(
      GRADE_SERVICE_TOKEN,
      new GradeService(Container.get(GradeRepository))
    );

    Container.set(
      GRADE_STATIONERY_SERVICE_TOKEN,
      new GradeStationeryService(
        Container.get(GradeStationeryRepository),
        Container.get(GradeRepository),
        Container.get(PRODUCT_AGGREGATION_SERVICE_TOKEN)
      )
    );

    // Register Amrod services
    Container.set(AMROD_CONFIG_SERVICE_TOKEN, new AmrodConfigService());

    Container.set(
      AMROD_CLIENT_SERVICE_TOKEN,
      new AmrodClientService(Container.get(AMROD_CONFIG_SERVICE_TOKEN))
    );

    // Register Parrot services
    Container.set(ParrotConfigService, new ParrotConfigService());

    Container.set(
      PARROT_CLIENT_SERVICE_TOKEN,
      new ParrotClientService(Container.get(ParrotConfigService))
    );

    // 🔥 REGISTER TARSUS SERVICES 🔥
    Container.set(TarsusConfigService, new TarsusConfigService());
    Container.set(
      TARSUS_CLIENT_SERVICE_TOKEN,
      new TarsusClientService(Container.get(TarsusConfigService))
    );

    // Register Product Aggregation Service
    Container.set(
      PRODUCT_AGGREGATION_SERVICE_TOKEN,
      new ProductAggregationService(
        Container.get(AMROD_CLIENT_SERVICE_TOKEN),
        Container.get(AMROD_CONFIG_SERVICE_TOKEN),
        Container.get(PARROT_CLIENT_SERVICE_TOKEN),
        Container.get(TARSUS_CLIENT_SERVICE_TOKEN),
        Container.get(BRANDING_PRODUCT_SERVICE_TOKEN),
        Container.get(PRODUCT_SERVICE_TOKEN),
        Container.get(FURNITURE_SERVICE_TOKEN),
        Container.get(CATEGORY_SERVICE_TOKEN)

      )
    );

    // In the initializeInterfaces method, add these after all other services:
    Container.set(SupplierProductRepository, new SupplierProductRepository());

    Container.set(
      SUPPLIER_PRODUCT_SERVICE_TOKEN,
      new SupplierProductService(Container.get(SupplierProductRepository))
    );

    Container.set(
      AutomatedSupplierDataService,
      new AutomatedSupplierDataService(
        Container.get(SUPPLIER_PRODUCT_SERVICE_TOKEN),
        Container.get(PARROT_CLIENT_SERVICE_TOKEN),
        Container.get(TARSUS_CLIENT_SERVICE_TOKEN),
        Container.get(AMROD_CLIENT_SERVICE_TOKEN)
      )
    );
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/api", route.router);
    });
  }

  // Add this method to your App class:
  private initializeScheduler() {
    MidnightScheduler.start();
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }

  private initializeUnhandledErrorHandling() {
    process.on("unhandledRejection", (reason: Error, promise: Promise<any>) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    });

    process.on("uncaughtException", (error: Error) => {
      logger.error(`Uncaught Exception: ${error}`);
    });
  }
}
