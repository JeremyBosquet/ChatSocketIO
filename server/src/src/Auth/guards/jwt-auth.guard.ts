import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/Users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
// 	constructor (
// 	private readonly userService: UsersService,
// 	private jwtService: JwtService,
// ){ super()}
// async canActivate(context: ExecutionContext): Promise<boolean> {
// 	const parentCanActivate = (await super.canActivate(context)) as boolean;
// 	let result : boolean = false;
// 	const tokenCrypted = context.switchToHttp().getRequest().headers.authorization.substr(7);
// 	if (tokenCrypted)
// 	{
// 		const token  = this.jwtService.decode(tokenCrypted);
// 		const tokenUuid = token['uuid'];
// 		if (tokenUuid)
// 		{
// 			const User = await this.userService.findUserByUuid(tokenUuid);
// 			const matchingToken = User.isLoggedIn.find(tokenObject => {
// 				return bcrypt.compare(tokenCrypted, tokenObject.token);
// 			  });
// 			  if (matchingToken) {
// 				result = true;
// 			  }
// 		}
// 	}
// 	return parentCanActivate && result;
//   }
}