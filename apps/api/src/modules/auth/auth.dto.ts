import { Transform } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf
} from "class-validator";
import { UserRole } from "@prisma/client";
import {
  AUTH_LIMITS,
  EMAIL_REGEX,
  GMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_STRONG_REGEX,
  normalizeEmail,
  normalizeFullName
} from "./auth.rules";

export class RegisterDto {
  @Transform(({ value }) => (typeof value === "string" ? normalizeEmail(value) : value))
  @IsString()
  @MinLength(AUTH_LIMITS.emailMin)
  @MaxLength(AUTH_LIMITS.emailMax)
  @IsEmail()
  @Matches(EMAIL_REGEX, {
    message: "Please enter a valid email address."
  })
  @Matches(GMAIL_REGEX, {
    message: "Please use a valid Gmail address ending in @gmail.com."
  })
  email!: string;

  @IsString()
  @MinLength(AUTH_LIMITS.passwordMin)
  @MaxLength(AUTH_LIMITS.passwordMax)
  @Matches(PASSWORD_STRONG_REGEX, {
    message:
      "Password must be 8–128 characters with uppercase, lowercase, and a number (no spaces)."
  })
  password!: string;

  @Transform(({ value }) => (typeof value === "string" ? normalizeFullName(value) : value))
  @IsString()
  @MinLength(AUTH_LIMITS.fullNameMin)
  @MaxLength(AUTH_LIMITS.fullNameMax)
  fullName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(AUTH_LIMITS.phoneMax)
  @ValidateIf((o: RegisterDto) => Boolean(o.phone?.trim()))
  @Matches(PHONE_REGEX, {
    message: "Please enter a valid Philippine mobile number in this format: 09xx xxx xxxx."
  })
  phone?: string;

  @IsOptional()
  @IsIn([UserRole.BUYER, UserRole.SELLER])
  role?: UserRole;
}

export class LoginDto {
  @Transform(({ value }) => (typeof value === "string" ? normalizeEmail(value) : value))
  @IsString()
  @MinLength(AUTH_LIMITS.emailMin)
  @MaxLength(AUTH_LIMITS.emailMax)
  @IsEmail()
  @Matches(EMAIL_REGEX, {
    message: "Please enter a valid email address."
  })
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(AUTH_LIMITS.passwordMax)
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}

export class CheckEmailQueryDto {
  @Transform(({ value }) => (typeof value === "string" ? normalizeEmail(value) : value))
  @IsString()
  @MinLength(AUTH_LIMITS.emailMin)
  @MaxLength(AUTH_LIMITS.emailMax)
  @Matches(EMAIL_REGEX, {
    message: "Please enter a valid email address."
  })
  email!: string;
}

/** Normalize email after class-validator transforms body. */
export function sanitizeRegisterBody(body: RegisterDto) {
  return {
    email: normalizeEmail(body.email),
    password: body.password,
    fullName: body.fullName.trim().replace(/\s+/g, " "),
    phone: body.phone?.trim() || undefined,
    role: body.role
  };
}

export function sanitizeLoginBody(body: LoginDto) {
  return {
    email: normalizeEmail(body.email),
    password: body.password
  };
}
