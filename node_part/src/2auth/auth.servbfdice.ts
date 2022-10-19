// import { Injectable } from '@nestjs/common';
// import { UsersService } from '../users/users.service';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import { AuthModel } from './auth.entity';
 
// @Injectable()
// export class AuthenticationService {
//   constructor(
//     private readonly usersService: UsersService,
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService
//   ) {}
 
//   public getCookieWithJwtAccessToken(userId: number, isSecondFactorAuthenticated = false) {
//     const payload : AuthModel =  { 
// 		userId : userId, 
// 		isSecondFactorAuthenticated : isSecondFactorAuthenticated, 
// 	};
//     const token = this.jwtService.sign(payload, {
//       secret: this.configService.get('JWT_SECRET'),
//     });
//     return `Authentication=${token}; HttpOnly; Path=/;}`;
//   }
// }