import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { envSchema } from "./environment/env";
import { EnvModule } from "./environment/env.module";
import { HttpModule } from "./http/http.module";
import { AuthModule } from "./auth/auth.module";
import * as path from "path";
import {
  I18nModule,
  QueryResolver,
  AcceptLanguageResolver,
  HeaderResolver,
} from "nestjs-i18n";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-yet";
import { BullModule } from "@nestjs/bull";
import { ScheduleModule } from "@nestjs/schedule";
import { CronModule } from "./cron/cron.module";
import { WebsocketModule } from "./websocket/websocket.module";
import { ExcelModule } from "./xlsx/xlsx.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: "pt",
        loaderOptions: {
          path: path.join(__dirname, "../i18n/"),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ["lang"] },
        AcceptLanguageResolver,
        new HeaderResolver(["Accept-Language"]),
      ],
    }),
    CacheModule.register({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: config.get("REDIS_HOST"),
            port: config.get("REDIS_PORT"),
          },
        });

        return {
          store,
          ttl: 30 * 1000,
        };
      },
      store: redisStore,
      inject: [ConfigService],
    }),
    BullModule.forRoot({
      redis: {
        host: "redis",
        port: 6379,
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    EnvModule,
    HttpModule,
    CronModule,
    WebsocketModule,
    ExcelModule,
  ],
})
export class AppModule {}
