import { Module } from "@nestjs/common";
import { TranslationsModule } from "../translations/translations.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { ForecastController } from "./forecast.controller";
import { ForecastService } from "./forecast.service";

@Module({
  imports: [TranslationsModule],
  controllers: [AdminController, ForecastController],
  providers: [AdminService, ForecastService]
})
export class AdminModule {}
