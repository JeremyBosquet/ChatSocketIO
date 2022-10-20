// import { Controller, Get, Redirect, Res, UseGuards,  } from '@nestjs/common';
// import { FtOauthGuard } from './guards/ft-oauth.guard';
// import { AuthenticatedGuard } from './guards/authenticated.guard';
// import { AppService } from 'src/app.service';
// import { User } from 'src/login/user.decorator';
// import { Profile } from 'passport-42';

// @Controller('login')
// export class LoginController {
// 	constructor(private readonly appService : AppService) {}
// //   @Get()
// //   @UseGuards(FtOauthGuard)
// //   ft(){
// // 	return;
// //   }

// //   @Get('42/return')
// //   @UseGuards(FtOauthGuard)
// //   @Redirect('/')
// //   async logIn(@User() user: Profile) {
// // 	const logged = await this.appService.logIn(user);
// //     return ;
// //   }
// }
