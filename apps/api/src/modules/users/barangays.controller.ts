import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Controller("barangays")
export class BarangaysController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.barangay.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });
  }
}
