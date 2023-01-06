import {
	Controller,
	Get,
	Req,
	UseGuards,
	Res,
	HttpStatus,
	Param,
} from '@nestjs/common';
import { Profile } from 'passport-42';
import { UsersService } from './Users/users.service';
import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt';
import { JwtTwoFactorGuard } from './TwoFactorAuth/guards/jwt-two-factor.guard';

@Controller('api')
export class AppController {
	constructor(
		private readonly userService: UsersService,
		private readonly appService: AppService,
		private jwtService: JwtService,
	) { }

	@Get('status')
	async status(@Req() req: any, @Res() res: any) {
		return res.status(HttpStatus.OK).json({ status: 'ok' });
	}
	@Get('login')
	ft() {
		return `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.FORTYTWO_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code`;
	}

	@Get('login/42/return/:code')
	async logIn(@Param() param: any, @Res() res: any) {
		if (!param.code) return;

		const getToken = await fetch(`https://api.intra.42.fr/oauth/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				grant_type: 'authorization_code',
				client_id: process.env.FORTYTWO_CLIENT_ID,
				client_secret: process.env.FORTYTWO_CLIENT_SECRET,
				redirect_uri: process.env.REDIRECT_URI,
				code: param.code,
			}),
		});

		if (!getToken || !getToken.ok) {
			console.error('failed to get token');
		}

		const json_data = await getToken.json();

		if (!('access_token' in json_data))
			return res.status(HttpStatus.FORBIDDEN).json({
				statusCode: HttpStatus.FORBIDDEN,
				message: 'failed to get token',
				error: 'FORBIDDEN',
			});

		const myUser = await fetch(`https://api.intra.42.fr/v2/me`, {
			headers: {
				Authorization: `Bearer ${json_data.access_token}`,
			},
		});

		if (!myUser || !myUser.ok) {
			console.error(myUser);
		}

		const user = (await myUser.json()) as Profile;

		if (user) {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				token: await this.appService.logIn(user),
				message: 'succes',
			});
		}
		return res
			.status(HttpStatus.FORBIDDEN)
			.json({
				statusCode: HttpStatus.FORBIDDEN,
				message: 'invalid token',
				error: 'FORBIDDEN',
			});
	}

	@Get('logout')
	@UseGuards(JwtTwoFactorGuard)
	async logOut(@Req() req: any, @Res() res: any) {
		const User = await this.userService.findUserByUuid(req.user.uuid);
		if (User) {
			this.userService.IsntAuthenticated(User.uuid);
			this.userService.IsntLoggedIn(User.uuid, req.headers.authorization.split(' ')[1]);
		}
		req.logOut(function () {
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'succes',
			});
		});
	}

}
