import { BadRequestException, Injectable } from "@nestjs/common";
import { AuditAction, StoreStatus, User, UserStatus } from "@prisma/client";
import { AuditService } from "../../audit/audit.service";
import { editableTranslationKeys, isSupportedLocale } from "../../i18n/translation-registry";
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
      include: {
        buyer: { select: { id: true, email: true, fullName: true } },
        sellerOrders: { include: { store: true } },
        payments: true
      },
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

  async updateTranslation(admin: User, key: string, locale: string, value: string) {
    if (!editableTranslationKeys.has(key)) {
      throw new BadRequestException("This translation key is not registered by a developer.");
    }

    if (!isSupportedLocale(locale)) {
      throw new BadRequestException("Unsupported locale.");
    }

    const translation = await this.prisma.translationOverride.upsert({
      where: { key_locale: { key, locale } },
      create: { key, locale, value: value.trim(), updatedById: admin.id },
      update: { value: value.trim(), updatedById: admin.id }
    });

    await this.audit.write({
      actorId: admin.id,
      action: AuditAction.UPDATE,
      entityType: "TranslationOverride",
      entityId: translation.id,
      metadata: { key, locale }
    });

    return translation;
  }
}
