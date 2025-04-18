import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { EnvService } from "../environment/env.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    env: EnvService
  ) {
    super({
      clientID: env.get("GOOGLE_CLIENT_ID"),
      clientSecret: env.get("GOOGLE_SECRET"),
      callbackURL: env.get("GOOGLE_CALLBACK_URL"),
      scope: [
        "profile", "email"
      ]
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log(
      accessToken,
      refreshToken, 
      profile._json.profile
    );
  }
}