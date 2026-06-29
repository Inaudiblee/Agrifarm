import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { SellersModule } from "./modules/sellers/sellers.module";
import { StoresModule } from "./modules/stores/stores.module";
import { ProductsModule } from "./modules/products/products.module";
import { CartsModule } from "./modules/carts/carts.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { DocsModule } from "./modules/docs/docs.module";
import { HealthModule } from "./modules/health/health.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { AdminModule } from "./modules/admin/admin.module";
import { TranslationsModule } from "./modules/translations/translations.module";
import { AuditModule } from "./audit/audit.module";
import { RateLimitGuard } from "./security/rate-limit.guard";
import { RolesGuard } from "./security/roles.guard";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { QueueModule } from "./queue/queue.module";
import { SocketModule } from "./socket/socket.module";

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    QueueModule,
    SocketModule,
    AuditModule,
    AuthModule,
    UsersModule,
    SellersModule,
    StoresModule,
    ProductsModule,
    CartsModule,
    OrdersModule,
    PaymentsModule,
    DocsModule,
    HealthModule,
    CategoriesModule,
    TranslationsModule,
    AdminModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: RateLimitGuard },
    RolesGuard
  ]
})
export class AppModule {}
