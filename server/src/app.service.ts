import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './typeorm/user.entity';
import { Repository } from 'typeorm';
import { Profile } from 'passport-42';
import { number } from 'joi';
import { JwtService } from '@nestjs/jwt'
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from 'crypto';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService {
  constructor(@InjectRepository(UserModel) private readonly userRepository: Repository<UserModel>,
  private readonly userService: UsersService ,
  private jwtService: JwtService) {}

  async logIn(user: Profile) {
	const findUser = (await this.userRepository.find({ where: { id: user.id} }));
	if (findUser[0])
	{
		console.log(user);
		this.userService.IsLoggedIn(user.id);
		const payload = { id : user.id};
		const token = this.jwtService.sign(payload)
		console.log(token);
		return (token);
	}
	else
	{
		let customUsername : string = user.login;
		let User = await this.userRepository.find({where : {username : customUsername}})
		while (User[0])
		{
			console.log(await this.userRepository.find({where : {username : customUsername}}));
			customUsername += randomInt(9);
			console.log(customUsername)
			User = await this.userRepository.find({where : {username : customUsername}})
		}
		const form : UserModel = {
				createdAt : new Date(Date.now()), 
				id : user.id, 
				uuid : uuidv4(), 
				image : user.image_url,
				username : customUsername,
				trueUsername : user.login,
				twoFactorAuthenticationSecret: "null",
				isTwoFactorAuthenticationEnabled : false,
				isSecondFactorAuthenticated : false,
				isLoggedIn : true,
			};
		const newUser = this.userRepository.create(form);
		await this.userRepository.save(newUser);
		const payload = { id : user.id};
		const token = this.jwtService.sign(payload)
		console.log(token);
		return (token);
	}
  }
}