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
	// 	console.log("1", Date.now());
	// 	const parentCanActivate = (await super.canActivate(context)) as boolean; // 3
	// 	console.log("-2", Date.now());
	// 	let result : boolean = false;
	// 	const tokenCrypted = context.switchToHttp().getRequest().headers.authorization.substr(7); // 1
	// 	console.log("2", Date.now());
	// 	if (tokenCrypted)
	// 	{
	// 		const token  = this.jwtService.decode(tokenCrypted);
	// 		console.log("3", Date.now()); // 1
	// 		const tokenUuid = token['uuid'];
	// 		if (tokenUuid)
	// 		{
	// 			const User = await this.userService.findUserByUuid(tokenUuid); // 3
	// 			console.log("4", Date.now());
	// 			const matchingToken = User.isLoggedIn.find(tokenObject => {
	// 				return bcrypt.compare(tokenCrypted, tokenObject.token); // 3
	// 			  });
	// 			  if (matchingToken) {
	// 				result = true;
	// 			  }
	// 			console.log("5", Date.now());
	// 		}
	// 	}
	// 	console.log("6", Date.now());
	// 	return parentCanActivate && result;
	//   }
}
