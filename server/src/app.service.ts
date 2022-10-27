import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ifriends, UserModel } from './typeorm/user.entity';
import { Repository } from 'typeorm';
import { Profile } from 'passport-42';
import { any, array, number } from 'joi';
import { JwtService } from '@nestjs/jwt'
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from 'crypto';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService {
	constructor(@InjectRepository(UserModel) private readonly userRepository: Repository<UserModel>,
		private readonly userService: UsersService,
		private jwtService: JwtService) { }

	async logIn(user: Profile) {
		const findUser = (await this.userRepository.find()).filter(users => users.id === user.id)
		if (findUser[0]) {
			this.userService.IsLoggedIn(findUser[0].uuid);
			const payload = { uuid: findUser[0].uuid };
			const token = this.jwtService.sign(payload)
			console.log(token);
			return (token);
		}
		else {
			let customUsername: string = user.login;
			let User = await this.userRepository.find({ where: { username: customUsername } })
			while (User[0]) {
				customUsername += randomInt(9);
				User = await this.userRepository.find({ where: { username: customUsername } })
			}
			let newList: Ifriends[] = [];
			// const newFriend : Ifriends = {
			// 	uuid : "prevent_null",
			// };
			//newList.push(newFriend);
			const newUuid: string = uuidv4();
			const form: UserModel = {
				createdAt: new Date(Date.now()),
				id: user.id,
				uuid: newUuid,
				image: user.image_url,
				username: customUsername,
				trueUsername: user.login,
				twoFactorAuthenticationSecret: "null",
				isTwoFactorAuthenticationEnabled: false,
				isSecondFactorAuthenticated: false,
				isLoggedIn: true,
				friendRequest: newList,
				friends: newList,
				blocked: newList,
				blockedby: newList,
				friendsNotacceptedYet: newList,
			};
			const newUser = this.userRepository.create(form);
			await this.userRepository.save(newUser);
			const payload = { uuid: newUuid };
			const token = this.jwtService.sign(payload)
			console.log(token);
			return (token);
		}
	}
}