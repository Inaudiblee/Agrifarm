import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "@prisma/client";
import { AuthenticatedRequest, AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn([UserRole.BUYER, UserRole.SELLER])
  role?: UserRole;
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

class ActivateDto {
  @IsEmail()
  staticEmail!: string;

  @IsEmail()
  personalEmail!: string;

  @IsString()
  code!: string;
}

class CheckEmailQueryDto {
  @IsEmail()
  email!: string;
}

class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post("activate")
  activate(@Body() body: ActivateDto) {
    return this.authService.activate(body);
  }

  @Get("check-email")
  async checkEmail(@Query() query: CheckEmailQueryDto) {
    const email = query.email.trim().toLowerCase();
    const existing = await this.authService.findUserByEmail(email);
    return {
      available: !existing,
      valid: true,
      email,
    };
  }

  @Post("refresh")
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post("logout")
  logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body.refreshToken);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  me(@Req() request: AuthenticatedRequest) {
    return { user: this.authService.publicUser(request.user!) };
  }
}
