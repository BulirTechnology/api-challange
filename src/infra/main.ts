import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { EnvService } from "./environment/env.service";
import { ValidationPipe } from "@nestjs/common";
import basicAuth from "express-basic-auth";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  app.enableCors({
    origin: "*",
    methods: "*",
  });

  const envService = app.get(EnvService);
  const port = envService.get("PORT");
  const swaggerPassword = envService.get("SWAGGER_PASSWORD") ?? "Bulir8080";

  app.use(
    ["/docs", "/docs-json"],
    basicAuth({
      challenge: true,
      users: { admin: swaggerPassword },
    })
  );

  const config = new DocumentBuilder()
    .setTitle("Bulir API")
    .setDescription(
      "Here is the Bulir API documentation, where you will find all data about it."
    )
    .setVersion(envService.get("APP_VERSION"))
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  await app.listen(port);
  console.log(port);
}
bootstrap();
