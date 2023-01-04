import { ConsoleLogger, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/Users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {
	// constructor (
	// 	private readonly userService: UsersService,
	// 	private jwtService: JwtService,
	// ){ super()}
	// async canActivate(context: ExecutionContext): Promise<boolean> {
	// 	const parentCanActivate = (await super.canActivate(context)) as boolean;
	// 	let result : boolean = false;
	// 	const tokenCrypted = context.switchToHttp().getRequest().headers.authorization.split(' ')[1];
	// 	if (tokenCrypted)
	// 	{
	// 		const token  = this.jwtService.decode(tokenCrypted);
	// 		if (token['uuid'])
	// 		{
	// 			const User = await this.userService.findUserByUuid(token['uuid']);
	// 			for (let i = 0; i < User.isLoggedIn.length; i++) {
	// 				if (await bcrypt.compare(tokenCrypted , User.isLoggedIn[i].token)) {
	// 					result = true;
	// 					break;
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return parentCanActivate && result;
	//   }
}
