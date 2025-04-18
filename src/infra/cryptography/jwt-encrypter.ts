
import { Encrypter, EncrypterResponse } from "@/domain/users/application/cryptography/encrypter";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { EnvService } from "../environment/env.service";

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(
    private env: EnvService,
    private jwtService: JwtService
  ) { }

  async encrypt(payload: Record<string, unknown>, rememberMe: boolean): Promise<EncrypterResponse> {
    let expiresInToken = 60 * 60 * 24 * 3,
      expiresInRefreshToken = 60 * 60 * 24 * 7;

    if (rememberMe) {
      expiresInToken = 60 * 60 * 24 * 7;
    }

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(payload, {
        expiresIn: 60 * 60 * 24 * 7,
        secret: this.env.get("JWT_AUTH_TOKEN_KEY")
      }),
      await this.jwtService.signAsync({ ...payload, type: "refresh" }, {
        expiresIn: expiresInRefreshToken,
        secret: this.env.get("JWT_REFRESH_KEY")
      }),
    ]);

    return {
      accessToken,
      refreshToken
    };
  }
}