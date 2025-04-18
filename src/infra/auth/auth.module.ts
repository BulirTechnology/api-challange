import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { JwtStrategy } from "./jwt.strategy";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { EnvModule } from "../environment/env.module";
import { EnvService } from "../environment/env.service";
import { RefreshTokenStrategy } from "./refresh-token.strategy";
import { AuthTokenStrategy } from "./auth-token.strategy";
import { GoogleStrategy } from "./google.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory(env: EnvService) {
        const privateKey = env.get("JWT_PRIVATE_KEY");
        const publicKey = env.get("JWT_PUBLIC_KEY");

        return {
          /* signOptions: {
            algorithm: "RS256"
          }, */
          privateKey: Buffer.from(privateKey, "base64"),
          publicKey: Buffer.from(publicKey, "base64")
        };
      }
    })
  ],
  providers: [
    JwtStrategy,
    EnvService,
    RefreshTokenStrategy,
    AuthTokenStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
  ]
})
export class AuthModule { }