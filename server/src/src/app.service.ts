import { Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ifriends, ILogStatus, UserModel } from './typeorm/user.entity';
import { MetadataAlreadyExistsError, Repository } from 'typeorm';
import { Profile } from 'passport-42';
import { any, array, number } from 'joi';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from 'crypto';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';
import axios from 'axios';
import { promises as fs } from "fs";

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) { }

  async logIn(user: Profile) {
    const findUser = (await this.userRepository.find()).filter(
      (users) => users.id === user.id,
    );
    if (findUser[0]) {
      const payload = { uuid: findUser[0].uuid };
      const token = this.jwtService.sign(payload, { expiresIn: '2d' });
      this.userService.IsLoggedIn(findUser[0].uuid, token);

      return token;
    }
    else {
		async function fetchAndStoreImage(apiUrl: string, path : string, name : string) {
			// const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
			// const imageData = response.data;
			// return (Buffer.from(imageData));
	
	
			const response = await fetch(apiUrl);
	
			const blob = await response.blob();
	
			const arrayBuffer = await blob.arrayBuffer();
	
			const buffer = Buffer.from(arrayBuffer);
	
			await fs.writeFile(path + name, buffer);
	
			return (process.env.BACK + name);
	
		  }
		let userImg : string = "";
		if (user.image.link)
			userImg = await fetchAndStoreImage(user.image.link, "./src/uploads/avatar/" , Date().replace(/ /g, '') + ".jpg");
		else
			userImg = "http://90.66.199.176:7000/unknow.png";
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
      const newUuid: string = uuidv4();
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
      console.log(token);
      this.userService.IsLoggedIn(findUser[0].uuid, token);
      return token;
    }
  }
}
