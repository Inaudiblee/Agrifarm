import { Module } from "@nestjs/common";
import { BarangaysController } from "./barangays.controller";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [BarangaysController, UsersController],
  providers: [UsersService]
})
export class UsersModule {}
