import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ifriends, ILogStatus, UserModel } from './typeorm/user.entity';
import { Repository } from 'typeorm';
import { Profile } from 'passport-42';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from 'crypto';
import { UsersService } from './Users/users.service';
import * as fs from "fs";

@Injectable()
export class AppService {
	constructor(
		@InjectRepository(UserModel)
		private readonly userRepository: Repository<UserModel>,
		private readonly userService: UsersService,
		private jwtService: JwtService,
	) { }

	async logIn(user: Profile) {
		const findUser = await this.userRepository.findOneBy({ id: user.id })
		if (findUser) {
			const path = "./src/uploads/avatar/"
			if (findUser.image && !(fs.existsSync(path + findUser.image)))
			{
				findUser.image = 'unknow.png';
				await this.userRepository.update(findUser.uuid, { image: findUser.image });
			}
			const payload = { uuid: findUser.uuid };
			const token = this.jwtService.sign(payload, { expiresIn: '2d' });
			await this.userService.IsLoggedIn(findUser.uuid, token);
			return token;
		}
		else {
			async function fetchAndStoreImage(apiUrl: string, path: string, name: string) {

				const response = await fetch(apiUrl);

				const blob = await response.blob();

				const arrayBuffer = await blob.arrayBuffer();

				const buffer = Buffer.from(arrayBuffer);

				fs.writeFile(path + name, buffer, (err) => {
					if (err) {
					}
				});

				return (name);

			}
			const newUuid: string = uuidv4();
			let userImg: string = "";
			if (user.image.link)
				userImg = await fetchAndStoreImage(user.image.link, "./src/uploads/avatar/", newUuid + ".jpg");
			else
				userImg = 'unknow.png';
			let userLogin = user.login;
			if (!userLogin)
				userLogin = "John Doe";
			let customUsername: string = userLogin;
			let User = await this.userRepository.find({
				where: { username: customUsername },
			});
			while (User[0]) {
				customUsername += randomInt(9);
				User = await this.userRepository.find({
					where: { username: customUsername },
				});
			}
			let newList: Ifriends[] = [];
			let isLoggedIn: ILogStatus[] = [];
			const form: UserModel = {
				createdAt: new Date(Date.now()),
				id: user.id,
				uuid: newUuid,
				image: userImg,
				username: customUsername,
				trueUsername: userLogin,
				twoFactorAuthenticationSecret: 'null',
				isTwoFactorAuthenticationEnabled: false,
				isSecondFactorAuthenticated: false,
				isLoggedIn: isLoggedIn,
				friendRequest: newList,
				friends: newList,
				blocked: newList,
				blockedby: newList,
				friendsNotacceptedYet: newList,
				exp: 0.00,
			};
			const newUser = this.userRepository.create(form);
			await this.userRepository.save(newUser);
			const payload = { uuid: newUuid };
			const token = this.jwtService.sign(payload, { expiresIn: '2d' });
			await this.userService.IsLoggedIn(newUuid, token);
			return token;
		}
	}
}
