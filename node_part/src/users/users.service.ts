import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from '../typeorm/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './users.dto';
import { number } from 'joi';
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel) private readonly userRepository: Repository<UserModel>,
  ) {}
      
  async createUser(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }
      
  async findUsersById(id: number) {
    return await this.userRepository.findOne({where : {id : id}});
  }

  async getUsers(): Promise<UserModel[]> {
	return await this.userRepository.find();
  }

//   async clearDatabase(){
// 	console.log("Clear database in progress :");
// 	const list = await this.userRepository.find()
// 	for (let i = 0; i < list.length; i++) {
// 	  await this.userRepository.remove(list[i]);
// 	}
// 	console.log("done");

//   }

  async getMyUser(userId: any) : Promise<UserModel> {
	const findUser = (await this.userRepository.find()).filter(users => users.id === userId)[0];
	if (findUser)
		return (findUser);
	return ;
  }
}