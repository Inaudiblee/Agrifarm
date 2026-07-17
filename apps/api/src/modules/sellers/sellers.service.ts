import { BadRequestException, Injectable } from "@nestjs/common";
import { AuditAction, FarmerGender, User } from "@prisma/client";
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
      where: { userId: user.id }
    });
  }

  async upsertProfile(user: User, input: { businessName: string; gender?: FarmerGender; avatarKey?: string }) {
    if (input.gender && input.avatarKey && !input.avatarKey.startsWith(input.gender.toLowerCase())) {
      throw new BadRequestException("Choose a farmer character that matches the selected gender.");
    }

    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.sellerProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          businessName: input.businessName,
          gender: input.gender,
          avatarKey: input.avatarKey
        },
        update: {
          businessName: input.businessName,
          gender: input.gender,
          avatarKey: input.avatarKey
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
