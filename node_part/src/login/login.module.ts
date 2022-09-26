import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from 'src/app.service';
import { UserModel } from 'src/typeorm';
import { FtStrategy } from './ft.strategy';
import { LoginController } from './login.controller';
import { SessionSerializer } from './session.serializer';

@Module({
imports: [TypeOrmModule.forFeature([UserModel])],
  controllers: [LoginController],
  providers: [ConfigService, FtStrategy, SessionSerializer, AppService, JwtService],
})
export class LoginModule {}
