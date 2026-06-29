import { Module } from "@nestjs/common";
import { TranslationsModule } from "../translations/translations.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [TranslationsModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
