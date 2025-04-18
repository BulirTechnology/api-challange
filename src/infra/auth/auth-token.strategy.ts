import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { EnvService } from "../environment/env.service";

import { Injectable } from "@nestjs/common";

type JwtPayload = {
  sub: string
}

@Injectable()
export class AuthTokenStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    env: EnvService
  ) {
    const authToken = env.get("JWT_AUTH_TOKEN_KEY");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: authToken,
      passReToCallback: true
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }

}