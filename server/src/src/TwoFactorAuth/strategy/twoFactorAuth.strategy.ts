import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../Users/users.service';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
	Strategy,
	'jwt-two-factor',
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UsersService,
		private token = ExtractJwt.fromAuthHeaderAsBearerToken()
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	async validate(payload: any) {
		console.log(payload)
		const user = await this.userService.findUserByUuid(payload.uuid);
		// console.log(super.authenticate.toString())
		if (user) {
			if (!user.isTwoFactorAuthenticationEnabled) {
				return { uuid: payload.uuid };
			}
			if (user.isSecondFactorAuthenticated) {
				return { uuid: payload.uuid };
			}
		}
	}
}
