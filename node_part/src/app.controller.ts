import {Controller,
		Get,
		Redirect,
		Render,
		Req,
		UseGuards,
		Res,
		HttpStatus} from '@nestjs/common';
import { User } from './login/user.decorator';
import { Profile } from 'passport-42';
import { AuthenticatedGuard } from './login/guards/authenticated.guard';
import { HttpService } from '@nestjs/axios';
import { UsersService } from './users/users.service';
import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt';


	@Controller()
	export class AppController {
		constructor(private readonly httpService: HttpService,
		private readonly userService: UsersService ,
		private readonly appService : AppService,
		private jwtService: JwtService) {}

		@Get()
		@Render('home')
		home(@User() user: Profile, @Req() req: any) {
			//console.log(user.photos[0].value);
			return { user };
		}

		// @Get('login')
		// @Render('login')
		// async logIn(@User user: Profile) {
		// 	const logged = await this.appService.logIn(user);
		// 	return ;
		// }

		@Get('profile')
		@UseGuards(AuthenticatedGuard)
		@Render('profile')
		profile(@User() user: Profile) {
			return { user };
		}

		@Get('logout')
		@Redirect('/')
		logOut(@Req() req: any) {
			req.logOut(function(){return;});
		}

		@Get('users/myUser')
		@UseGuards(AuthenticatedGuard)
		async myUser(@User() user: Profile, @Res() res: any, @Req() req: any) {
			const getUser = await this.userService.getMyUser(user.id);
			if (getUser)
				return res.status(HttpStatus.OK).json(getUser);
		}
}
