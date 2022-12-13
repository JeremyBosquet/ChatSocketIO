import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from 'src/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path/posix';
import { TwoFactorAuthenticationController } from './twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { UsersService } from 'src/users/users.service';
// import { AuthenticationService } from './auth.service';
import { JwtTwoFactorStrategy } from './auth.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel])],
  controllers: [TwoFactorAuthenticationController],
  providers: [TwoFactorAuthenticationService, UsersService, JwtService],
})
export class twoAuthModule {}
