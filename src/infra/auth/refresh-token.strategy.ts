import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { EnvService } from "../environment/env.service";

import { Injectable } from "@nestjs/common";

export type RefreshPayload = {
  sub: string
  type: string
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(
    env: EnvService
  ) {
    const refreshToken = env.get("JWT_REFRESH_KEY");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshToken,
      passReToCallback: true
    });
  }

  validate(params: RefreshPayload) {
    return params;
  }

}