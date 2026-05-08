import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { SellersModule } from "./modules/sellers/sellers.module";
import { StoresModule } from "./modules/stores/stores.module";
import { ProductsModule } from "./modules/products/products.module";
import { CartsModule } from "./modules/carts/carts.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PaymentsModule } from "./modules/payments/payments.module";
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
    AuthModule,
    UsersModule,
    SellersModule,
    StoresModule,
    ProductsModule,
    CartsModule,
    OrdersModule,
    PaymentsModule
  ]
})
export class AppModule {}
