import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../typeorm/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './users.dto';
import { number } from 'joi';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
      
  async createUser(createUserDto: CreateUserDto) {
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }
      
  async findUsersById(id: number) {
    return await this.userRepository.findOne({where : {id : id}});
  }

  async getUsers(): Promise<User[]> {
	return await this.userRepository.find();
  }
}