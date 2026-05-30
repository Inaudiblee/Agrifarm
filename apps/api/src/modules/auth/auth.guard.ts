import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { AuthService } from "./auth.service";

export type AuthenticatedRequest = {
  headers: { authorization?: string };
  user?: User;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = await this.authService.authenticateBearer(request.headers.authorization);
    return true;
  }
}
