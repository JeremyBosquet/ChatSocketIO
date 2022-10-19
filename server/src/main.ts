import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { HttpExceptionFilter } from './http-exception.filter';
import * as cookieParser from 'cookie-parser';
const multer = require("multer");

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
	"origin": "*",
	"methods": "GET,PUT,POST,DELETE",
	"preflightContinue": false,
	"optionsSuccessStatus": 204,
	});

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  app.use(
    session({ resave: false, saveUninitialized: false, secret: '!hulahoop69' }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());

  await app.listen(5000);
}
bootstrap();
