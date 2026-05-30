import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { StoreStatus, UserStatus } from "@prisma/client";
import { IsEnum } from "class-validator";
import { AuthenticatedRequest, AuthGuard } from "../auth/auth.guard";
import { Roles } from "../../security/roles.decorator";
import { RolesGuard } from "../../security/roles.guard";
import { AdminService } from "./admin.service";

class UserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}

class StoreStatusDto {
  @IsEnum(StoreStatus)
  status!: StoreStatus;
}

@UseGuards(AuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  users() {
    return this.adminService.users();
  }

  @Get("stores")
  stores() {
    return this.adminService.stores();
  }

  @Get("orders")
  orders() {
    return this.adminService.orders();
  }

  @Get("audit-logs")
  auditLogs() {
    return this.adminService.auditLogs();
  }

  @Patch("users/:id/status")
  updateUserStatus(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() body: UserStatusDto) {
    return this.adminService.updateUserStatus(request.user!, id, body.status);
  }

  @Patch("stores/:id/status")
  updateStoreStatus(@Req() request: AuthenticatedRequest, @Param("id") id: string, @Body() body: StoreStatusDto) {
    return this.adminService.updateStoreStatus(request.user!, id, body.status);
  }
}
