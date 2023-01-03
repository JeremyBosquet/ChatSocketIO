import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from 'src/typeorm';
import { JwtService } from '@nestjs/jwt';
import { TwoFactorAuthenticationController } from './twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { UsersService } from 'src/Users/users.service';

@Module({
	imports: [TypeOrmModule.forFeature([UserModel])],
	controllers: [TwoFactorAuthenticationController],
	providers: [TwoFactorAuthenticationService, UsersService, JwtService],
})
export class twoAuthModule { }
