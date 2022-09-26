import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './typeorm/user.entity';
import { Repository } from 'typeorm';
import { Profile } from 'passport-42';
import { number } from 'joi';
import { JwtService } from '@nestjs/jwt'
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  constructor(@InjectRepository(UserModel) private readonly userRepository: Repository<UserModel>,
  private jwtService: JwtService) {}

  async logIn(user: Profile, jwt: JwtService) {
	const findUser = (await this.userRepository.find()).filter(users => users.id === user.id)[0];
	if (findUser)
		return ;
	console.log(findUser);
	const form : UserModel = {
			createdAt : new Date(Date.now()), 
			id : user.id, 
			uuid : uuidv4(), 
			image : user.photos[0].value,
			username : user.username
		};
	const newUser = this.userRepository.create(form);
	await this.userRepository.save(newUser);
	const payload = { id : user.id };
	return {token: jwt.sign(payload)};
  }
}