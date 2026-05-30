import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, User } from "@prisma/client";
import { AuditService } from "../../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  list() {
    return this.prisma.category.findMany({
      include: { children: true, _count: { select: { products: true } } },
      orderBy: { name: "asc" }
    });
  }

  async create(user: User, input: { name: string; slug?: string; parentId?: string; description?: string }) {
    if (input.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: input.parentId } });
      if (!parent) throw new BadRequestException("Parent category not found.");
    }

    const category = await this.prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug ? slugify(input.slug) : slugify(input.name),
        parentId: input.parentId,
        description: input.description
      }
    });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.CREATE,
      entityType: "Category",
      entityId: category.id,
      metadata: { slug: category.slug }
    });
    return category;
  }

  async update(user: User, id: string, input: { name?: string; slug?: string; parentId?: string; description?: string }) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Category not found.");

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: slugify(input.slug) } : {}),
        ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
        ...(input.description !== undefined ? { description: input.description } : {})
      }
    });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.UPDATE,
      entityType: "Category",
      entityId: category.id,
      metadata: input
    });
    return category;
  }
}
