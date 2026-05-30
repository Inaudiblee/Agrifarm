import { Injectable } from "@nestjs/common";
import { AuditAction, StoreStatus, User, UserStatus } from "@prisma/client";
import { AuditService } from "../../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  users() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, fullName: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
  }

  stores() {
    return this.prisma.store.findMany({
      include: { sellerProfile: { include: { user: { select: { id: true, email: true, fullName: true } } } } },
      orderBy: { createdAt: "desc" }
    });
  }

  orders() {
    return this.prisma.order.findMany({
      include: { buyer: true, sellerOrders: { include: { store: true } }, payments: true },
      orderBy: { createdAt: "desc" }
    });
  }

  auditLogs() {
    return this.prisma.auditLog.findMany({
      include: { actor: { select: { id: true, email: true, fullName: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 200
    });
  }

  async updateUserStatus(admin: User, userId: string, status: UserStatus) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { status } });
    await this.audit.write({
      actorId: admin.id,
      action: AuditAction.STATUS_CHANGE,
      entityType: "User",
      entityId: user.id,
      metadata: { status }
    });
    return user;
  }

  async updateStoreStatus(admin: User, storeId: string, status: StoreStatus) {
    const store = await this.prisma.store.update({ where: { id: storeId }, data: { status } });
    await this.audit.write({
      actorId: admin.id,
      action: AuditAction.STATUS_CHANGE,
      entityType: "Store",
      entityId: store.id,
      metadata: { status }
    });
    return store;
  }
}
