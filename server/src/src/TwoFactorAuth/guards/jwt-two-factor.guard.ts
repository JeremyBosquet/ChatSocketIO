import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/Users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {
	constructor (
		private readonly userService: UsersService,
		private jwtService: JwtService,
	){ super()}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		// custom logic can go here
		const parentCanActivate = (await super.canActivate(context)) as boolean; // this is necessary due to possibly returning `boolean | Promise<boolean> | Observable<boolean>
		// custom logic goes here too
		console.log()
		const token  = this.jwtService.decode(context.switchToHttp().getRequest().headers.authorization.split(' ')[1]);
		const User = await this.userService.findUserByUuid(token['uuid']);
		let result : boolean = false;
		for (let i = 0; i < User.isLoggedIn.length; i++) {
			if (await bcrypt.compare(token['uuid'] , User.isLoggedIn[i].token)) {
				result = true;
				break;
			}
		}
		console.log("=", User.isLoggedIn[0].token, "=")
		console.log(await bcrypt.compare(token['uuid'] , User.isLoggedIn[0].token))
		return parentCanActivate && result;
	  }
}
