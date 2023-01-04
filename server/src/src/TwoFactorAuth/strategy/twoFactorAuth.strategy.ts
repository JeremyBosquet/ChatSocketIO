import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../Users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
	Strategy,
	'jwt-two-factor',
) {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UsersService,
		private jwtService: JwtService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	// async authenticate(request: any) {
	// 	try {
	// 		const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
	// 		const Jwt = this.jwtService.decode(jwt)
	// 		console.log(Jwt)
	// 		const user = super.authenticate(request);
	// 		console.log("user", user);
	// 		const payload = await this.validate({uuid : Jwt['uuid']});
	// 		console.log(payload)
	// 		if (!payload) {
	// 			throw new HttpException(
	// 				'Unauthorized access',
	// 				HttpStatus.UNAUTHORIZED,
	// 			);
	// 		}
	// 		super.success(payload);
	// 	} catch (err) {
	// 		throw new HttpException(
	// 			'Unauthorized access',
	// 			HttpStatus.UNAUTHORIZED,
	// 		);
	// 	}
	//}

	async validate(payload: any) {
		const user = await this.userService.findUserByUuid(payload.uuid);
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
