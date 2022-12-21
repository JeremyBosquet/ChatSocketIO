import {
  Controller,
  Get,
  Redirect,
  Req,
  UseGuards,
  Res,
  HttpStatus,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import { Profile } from 'passport-42';
import { HttpService } from '@nestjs/axios';
import { UsersService } from './users/users.service';
import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './typeorm';
import { Repository } from 'typeorm';
import { JwtTwoFactorGuard } from './2auth/jwt-two-factor.guard';

@Controller('api')
export class AppController {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly userService: UsersService,
    private readonly appService: AppService,
    private jwtService: JwtService,
  ) {}

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

    console.log(param.code);

    const r = await fetch(`https://api.intra.42.fr/oauth/token`, {
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

    if (!r || !r.ok) {
      console.error('failed to get token');
    }

    const json_data = await r.json();

    console.log(json_data.access_token);

    if (!('access_token' in json_data))
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'failed to get token',
        error: 'FORBIDDEN',
      });

    const r2 = await fetch(`https://api.intra.42.fr/v2/me`, {
      headers: {
        Authorization: `Bearer ${json_data.access_token}`,
      },
    });

    if (!r2 || !r2.ok) {
      console.error(r2);
    }

    const user = (await r2.json()) as Profile;

    //console.log(user);

    if (user)
	{
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
    console.log('logout');
    //this.userService.clearDatabase();
    const Jwt = this.jwtService.decode(req.headers.authorization.split(' ')[1]);
    const User = await this.userService.findUserByUuid(Jwt['uuid']);
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

  // @Get('users/myUser')
  // @UseGuards(AuthenticatedGuard)
  // async myUser(user: Profile, @Res() res: any, @Req() req: any) {
  // 	const getUser = await this.userService.getMyUser(user.id);
  // 	if (getUser)
  // 		return res.status(HttpStatus.OK).json(getUser);
  // }
}
