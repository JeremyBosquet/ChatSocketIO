import { HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../typeorm/user.entity';
import { Repository } from 'typeorm';
import { SendUserDto } from './users.dto';
import { number } from 'joi';
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel) private readonly userRepository: Repository<UserModel>,
  ) {}
      
  async setTwoFactorAuthenticationSecret(secret: string, id: number) {
    return this.userRepository.update({id}, {
      twoFactorAuthenticationSecret: secret
    });
  }

  async turnOnTwoFactorAuthentication(id: number) {
    return this.userRepository.update({id}, {
      isTwoFactorAuthenticationEnabled: true
    });
  }

  async turnOffTwoFactorAuthentication(id: number) {
    return this.userRepository.update({id}, {
      isTwoFactorAuthenticationEnabled: false,
	  isSecondFactorAuthenticated: false,
	  twoFactorAuthenticationSecret : "null",
    });
  }

  async IsAuthenticated(id: number) {
    return this.userRepository.update({id}, {
      isSecondFactorAuthenticated: true
    });
  }

  async IsLoggedIn(id: number) {
    return this.userRepository.update({id}, {
      isLoggedIn : true
    });
  }

  async IsntLoggedIn(id: number) {
    return this.userRepository.update({id}, {
      isLoggedIn: false
    });
  }

  async IsntAuthenticated(id: number) {
    return this.userRepository.update({id}, {
      isSecondFactorAuthenticated: false
    });
  }
      
  async findUserById(id: number) {
	  const find = await this.userRepository.find({where : {id : id}});
    return (find[0]);
  }

  async ChangeUsername(id: number, newName : string) {
	const alreadyexist = await this.userRepository.find({where : {username : newName}});
	if (alreadyexist[0])
		return (0);
	const user = (await this.userRepository.find({where : {id : id}}));
	if (user[0])
	{
		await this.userRepository.update({id}, {username : newName});
		return (1);
	}
	return (0);
  }

  async ChangeAvatar(id: number, newAvatar : string) {
	const user = (await this.userRepository.find({where : {id : id}}));
	if (user[0])
	{
		await this.userRepository.update({id}, {image : newAvatar});
		return (1);
	}
	return (0);
  }

  async getUsers(): Promise<UserModel[]> {
	return await this.userRepository.find();
  }

  async clearDatabase(){
	console.log("Clear database in progress :");
	const list = await this.userRepository.find()
	for (let i = 0; i < list.length; i++) {
	  await this.userRepository.remove(list[i]);
	}
	console.log("done");

  }

  async getMyUser(userId: any) : Promise<UserModel> {
	const findUser = (await this.userRepository.find({ where: { id: userId} }));
	if (findUser[0])
		return (findUser[0]);
	return ;
  }
}