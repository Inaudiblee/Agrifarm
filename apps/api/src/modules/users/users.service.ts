import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, User } from "@prisma/client";
import { AuditService } from "../../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";

const normalizeBarangay = (name: string) => name.trim().toLowerCase().replace(/\s+/g, " ");

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async listAddresses(user: User) {
    return this.prisma.address.findMany({
      where: { userId: user.id, deletedAt: null },
      include: { barangayRef: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
    });
  }

  async createAddress(
    user: User,
    input: {
      label?: string;
      recipientName: string;
      phone: string;
      street: string;
      barangay: string;
      city?: string;
      province?: string;
      postalCode?: string;
      isDefault?: boolean;
    }
  ) {
    const barangay = await this.prisma.barangay.findUnique({
      where: { normalizedName: normalizeBarangay(input.barangay) }
    });

    if (!barangay || !barangay.isActive) {
      throw new BadRequestException("Barangay is not serviceable in Pasig.");
    }

    const city = input.city?.trim() || "Pasig";
    const province = input.province?.trim() || "Metro Manila";
    if (city.toLowerCase() !== "pasig" || province.toLowerCase() !== "metro manila") {
      throw new BadRequestException("Agrifarm currently supports Pasig City, Metro Manila addresses only.");
    }

    return this.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      }

      const address = await tx.address.create({
        data: {
          userId: user.id,
          barangayId: barangay.id,
          label: input.label,
          recipientName: input.recipientName,
          phone: input.phone,
          street: input.street,
          barangay: barangay.name,
          city,
          province,
          postalCode: input.postalCode,
          isDefault: input.isDefault ?? false
        },
        include: { barangayRef: true }
      });
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.CREATE,
        entityType: "Address",
        entityId: address.id,
        metadata: { barangay: address.barangay, isDefault: address.isDefault },
        client: tx
      });
      return address;
    });
  }

  async getOwnedAddress(user: User, id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, userId: user.id, deletedAt: null },
      include: { barangayRef: true }
    });
    if (!address) {
      throw new NotFoundException("Address not found.");
    }

    return address;
  }

  async updateAddress(
    user: User,
    id: string,
    input: {
      label?: string;
      recipientName?: string;
      phone?: string;
      street?: string;
      barangay?: string;
      postalCode?: string;
      isDefault?: boolean;
    }
  ) {
    await this.getOwnedAddress(user, id);
    const barangay = input.barangay
      ? await this.prisma.barangay.findUnique({ where: { normalizedName: normalizeBarangay(input.barangay) } })
      : null;
    if (input.barangay && (!barangay || !barangay.isActive)) {
      throw new BadRequestException("Barangay is not serviceable in Pasig.");
    }

    return this.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      }

      const address = await tx.address.update({
        where: { id },
        data: {
          ...(input.label !== undefined ? { label: input.label } : {}),
          ...(input.recipientName ? { recipientName: input.recipientName } : {}),
          ...(input.phone ? { phone: input.phone } : {}),
          ...(input.street ? { street: input.street } : {}),
          ...(barangay ? { barangayId: barangay.id, barangay: barangay.name } : {}),
          ...(input.postalCode !== undefined ? { postalCode: input.postalCode } : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {})
        },
        include: { barangayRef: true }
      });
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.UPDATE,
        entityType: "Address",
        entityId: address.id,
        metadata: { barangay: address.barangay, isDefault: address.isDefault },
        client: tx
      });
      return address;
    });
  }

  async setDefaultAddress(user: User, id: string) {
    await this.getOwnedAddress(user, id);
    return this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      const address = await tx.address.update({ where: { id }, data: { isDefault: true }, include: { barangayRef: true } });
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.UPDATE,
        entityType: "Address",
        entityId: id,
        metadata: { isDefault: true },
        client: tx
      });
      return address;
    });
  }

  async deleteAddress(user: User, id: string) {
    await this.getOwnedAddress(user, id);
    const address = await this.prisma.address.update({ where: { id }, data: { deletedAt: new Date(), isDefault: false } });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.DELETE,
      entityType: "Address",
      entityId: id
    });
    return address;
  }
}
