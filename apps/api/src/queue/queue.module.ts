import { Global, Module } from "@nestjs/common";
import { Queue } from "bullmq";

export const ORDER_QUEUE = "ORDER_QUEUE";

@Global()
@Module({
  providers: [
    {
      provide: ORDER_QUEUE,
      useFactory: () =>
        new Queue("orders", {
          connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" }
        })
    }
  ],
  exports: [ORDER_QUEUE]
})
export class QueueModule {}
