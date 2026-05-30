import { BadRequestException, Injectable } from "@nestjs/common";
import { AuditAction, User, UserRole } from "@prisma/client";
import { AuditService } from "../../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SellersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async getProfile(user: User) {
    return this.prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      include: { stores: true }
    });
  }

  async upsertProfile(user: User, input: { businessName: string; businessPermitNo?: string; taxId?: string }) {
    return this.prisma.$transaction(async (tx) => {
      if (user.role !== UserRole.SELLER) {
        await tx.user.update({ where: { id: user.id }, data: { role: UserRole.SELLER } });
      }

      const profile = await tx.sellerProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          businessName: input.businessName,
          businessPermitNo: input.businessPermitNo,
          taxId: input.taxId
        },
        update: {
          businessName: input.businessName,
          businessPermitNo: input.businessPermitNo,
          taxId: input.taxId
        }
      });
      await this.audit.write({
        actorId: user.id,
        action: AuditAction.UPDATE,
        entityType: "SellerProfile",
        entityId: profile.id,
        metadata: { businessName: profile.businessName },
        client: tx
      });
      return profile;
    });
  }

  async requireSellerProfile(user: User) {
    const profile = await this.prisma.sellerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      throw new BadRequestException("Create a seller profile first.");
    }

    return profile;
  }
}
