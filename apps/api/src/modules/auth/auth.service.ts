import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuditAction, User, UserRole, UserStatus } from "@prisma/client";
import { createHash, createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { AuditService } from "../../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";

type TokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};

@Injectable()
export class AuthService {
  private readonly secret = process.env.JWT_SECRET ?? "change_me";
  private readonly tokenTtlSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 60 * 60 * 24);
  private readonly refreshTokenTtlSeconds = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS ?? 60 * 60 * 24 * 30);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async register(input: { email: string; password: string; fullName: string; phone?: string; role?: UserRole }) {
    const email = input.email.trim().toLowerCase();
    const role = input.role === UserRole.SELLER ? UserRole.SELLER : UserRole.BUYER;
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException("Email is already registered.");
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: this.hashPassword(input.password),
        fullName: input.fullName.trim(),
        phone: input.phone,
        role
      }
    });
    await this.audit.write({
      actorId: user.id,
      action: AuditAction.CREATE,
      entityType: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role }
    });

    return this.authResponse(user);
  }

  async login(input: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email.trim().toLowerCase() } });
    if (!user || user.status !== UserStatus.ACTIVE || !this.verifyPassword(input.password, user.passwordHash)) {
      throw new UnauthorizedException("Invalid credentials.");
    }

    await this.audit.write({ actorId: user.id, action: AuditAction.LOGIN, entityType: "User", entityId: user.id });
    return this.authResponse(user);
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date() ||
      storedToken.user.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });
    return this.authResponse(storedToken.user);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() }
    });
    return { loggedOut: true };
  }

  async authenticateBearer(authHeader: string | undefined) {
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    const payload = this.verifyToken(authHeader.slice("Bearer ".length));
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("User is not active.");
    }

    return user;
  }

  private async authResponse(user: User) {
    const iat = Math.floor(Date.now() / 1000);
    const refreshToken = randomBytes(32).toString("base64url");
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + this.refreshTokenTtlSeconds * 1000)
      }
    });

    return {
      token: this.signToken({ sub: user.id, email: user.email, role: user.role, iat, exp: iat + this.tokenTtlSeconds }),
      refreshToken,
      expiresIn: this.tokenTtlSeconds,
      refreshExpiresIn: this.refreshTokenTtlSeconds,
      user: this.publicUser(user)
    };
  }

  publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status
    };
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
    return `pbkdf2_sha256$120000$${salt}$${hash}`;
  }

  private verifyPassword(password: string, storedHash: string) {
    const [algorithm, iterations, salt, hash] = storedHash.split("$");
    if (algorithm !== "pbkdf2_sha256" || !iterations || !salt || !hash) {
      return false;
    }

    const candidate = pbkdf2Sync(password, salt, Number(iterations), 32, "sha256");
    const expected = Buffer.from(hash, "hex");
    return expected.length === candidate.length && timingSafeEqual(expected, candidate);
  }

  private signToken(payload: TokenPayload) {
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = createHmac("sha256", this.secret).update(body).digest("base64url");
    return `${body}.${signature}`;
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private verifyToken(token: string): TokenPayload {
    const [body, signature] = token.split(".");
    if (!body || !signature) {
      throw new UnauthorizedException("Invalid token.");
    }

    const expected = createHmac("sha256", this.secret).update(body).digest("base64url");
    const expectedBuffer = Buffer.from(expected);
    const providedBuffer = Buffer.from(signature);
    if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
      throw new UnauthorizedException("Invalid token.");
    }

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException("Token expired.");
    }

    return payload;
  }
}
