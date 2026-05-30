import { Global, Module } from "@nestjs/common";
import Redis from "ioredis";

export const REDIS = "REDIS_CLIENT";

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: () => {
        const client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
          lazyConnect: true,
          enableOfflineQueue: false,
          maxRetriesPerRequest: 1
        });
        client.on("error", (error) => {
          console.warn(`[redis] ${error.message}`);
        });
        return client;
      }
    }
  ],
  exports: [REDIS]
})
export class RedisModule {}
