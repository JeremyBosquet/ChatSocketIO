import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
 
@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor'
) {
  constructor(private readonly configService: ConfigService,
    private readonly userService: UsersService,) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET')
    });
  }
 
  async validate(payload: any) {
    const user = await this.userService.findUserByUuid(payload.uuid);
	if (user)
	{
		if (!user.isTwoFactorAuthenticationEnabled) {
			return {uuid: payload.uuid}
		}
		if (user.isSecondFactorAuthenticated) {
			return {uuid: payload.uuid}
		}
	}
  }
}