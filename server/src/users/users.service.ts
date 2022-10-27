import { HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ifriends, UserModel } from '../typeorm/user.entity';
import { Repository } from 'typeorm';
import { FriendsDto, SendUserDto } from './users.dto';
import { number } from 'joi';
import { JwtService } from '@nestjs/jwt'
import { plainToClass } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel) private readonly userRepository: Repository<UserModel>,
  ) {}
      
  async setTwoFactorAuthenticationSecret(secret: string, uuid: string) {
    return this.userRepository.update({uuid}, {
      twoFactorAuthenticationSecret: secret
    });
  }

  async turnOnTwoFactorAuthentication(uuid : string) {
    return this.userRepository.update({uuid}, {
      isTwoFactorAuthenticationEnabled: true
    });
  }

  async turnOffTwoFactorAuthentication(uuid : string) {
    return this.userRepository.update({uuid}, {
      isTwoFactorAuthenticationEnabled: false,
	  isSecondFactorAuthenticated: false,
	  twoFactorAuthenticationSecret : "null",
    });
  }

  async IsAuthenticated(uuid : string) {
    return this.userRepository.update({uuid}, {
      isSecondFactorAuthenticated: true
    });
  }

  async IsLoggedIn(uuid : string) {
    return this.userRepository.update({uuid}, {
      isLoggedIn : true
    });
  }

  async IsntLoggedIn(uuid : string) {
    return this.userRepository.update({uuid}, {
      isLoggedIn: false
    });
  }

  async IsntAuthenticated(uuid : string) {
    return this.userRepository.update({uuid}, {
      isSecondFactorAuthenticated: false
    });
  }
      
  async findUserByUuid(uuid : string) {
	  const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
    return (find);
  }

  async ListFriendsWithUuid(uuid : string) {
	const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
	if (find)
		return find.friends;
	return null;
  }

  async ListFriendsRequestedWithUuid(uuid : string) {
	const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
	if (find)
		return find.friendsNotacceptedYet;
	return null;
  }

  async ListFriendsRequestWithUuid(uuid : string) {
	const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
	if (find)
		return find.friendRequest;
	return null;
  }

  async ListBlockedWithUuid(uuid : string) {
	const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
	if (find)
		return find.blocked;
	return null;
  }

  async addUserByUuid(uuid: string, User : UserModel) {
	const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
	if (find)
	{
		if (uuid === User.uuid)
			return (2)
		if (User.friends)
		{
			for (let i = 0; User.friends[i] ; i++) {
				if (User.friends[i].uuid === uuid)
					return (3);
			}
		}
		if (find.friendRequest)
		{
			for (let i = 0; find.friendRequest[i] ; i++) {
				if (find.friendRequest[i].uuid === User.uuid)
					return (4);
			}
		}
		let newList : Ifriends[] = [];
		const askFriend : Ifriends = {
			uuid : User.uuid,
		};
		if (!find.friendRequest)
			newList.push(askFriend);
		else
		{
			newList = find.friendRequest;
			newList.push(askFriend);
		}
		await this.userRepository.update(uuid, {friendRequest : newList});
		newList = [];
		askFriend.uuid = uuid
		if (!User.friendsNotacceptedYet)
			newList.push(askFriend);
		else
		{
			newList = User.friendsNotacceptedYet;
			newList.push(askFriend);
		}
		await this.userRepository.update(User.uuid, {friendsNotacceptedYet : newList});
		return (1);
	}
	return (0);
	}

	async acceptUserByUuid(uuid: string, User : UserModel) {
		const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
		if (find)
		{
			if (User.friendRequest)
			{
				let i = 0
				for (i = 0; User.friendRequest[i] ; i++) {
					if (User.friendRequest[i].uuid === uuid)
					{
						let newList : Ifriends[] = [];
						let removeRequest : Ifriends[] = User.friendRequest;
						const newFriend : Ifriends = {
							uuid : uuid,
						};
						if (!User.friends)
							newList.push(newFriend);
						else
						{
							newList = User.friends;
							newList.push(newFriend);
						}
						removeRequest.splice(i, 1);
						await this.userRepository.update(User.uuid, {friends : newList});
						await this.userRepository.update(User.uuid, {friendRequest : removeRequest});
						newList = [];
						newFriend.uuid = User.uuid
						if (!find.friends)
							newList.push(newFriend);
						else
						{
							newList = find.friends;
							newList.push(newFriend);
						}
						await this.userRepository.update(uuid, {friends : newList});
						if (find.friendsNotacceptedYet)
						{
							for (i = 0; find.friendsNotacceptedYet[i] ; i++) {
								if (find.friendsNotacceptedYet[i].uuid === User.uuid)
								{
									removeRequest = find.friendsNotacceptedYet;
									removeRequest.splice(i, 1);
								}
							}
							await this.userRepository.update(uuid, {friendsNotacceptedYet : removeRequest});
						}
						return (1);
					}
				}
				if (i == 0)
					return (3);
				return (2)
			}
			return (3);
		}
		return (0);
	}

	async blockUserByUuid(uuid: string, User : UserModel) {
		const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
		if (find)
		{
			if (uuid === User.uuid)
				return (2)
			if (User.blocked)
			{
				for (let i = 0; User.blocked[i] ; i++) {
					if (User.blocked[i].uuid === uuid)
						return (3);
				}
			}
			let newList : Ifriends[] = [];
			let blockUser : Ifriends = {
				uuid : User.uuid,
			};
			if (!find.blockedby)
				newList.push(blockUser);
			else
			{
				newList = find.blockedby;
				newList.push(blockUser);
			}
			await this.userRepository.update(uuid, {blockedby : newList});
			newList = [];
			blockUser.uuid = uuid;
			if (!User.blocked)
				newList.push(blockUser);
			else
			{
				newList = User.blocked;
				newList.push(blockUser);
			}
			await this.userRepository.update(User.uuid, {blocked : newList});
			let removeBlocked : Ifriends[] = [];
			let verify : boolean = false
			if (find.friends)
			{
				for (let i = 0; find.friends[i] ; i++) {
					if (find.friends[i].uuid === User.uuid)
					{
						removeBlocked = find.friends;
						removeBlocked.splice(i, 1);
						verify = true;
					}
				}
				if (verify)
					await this.userRepository.update(uuid, {friends: removeBlocked});
			}
			removeBlocked = [];
			verify = false;
			if (User.friends)
			{
				for (let i = 0; User.friends[i] ; i++) {
					if (User.friends[i].uuid === uuid)
					{
						removeBlocked = User.friends;
						removeBlocked.splice(i, 1);
						verify = true;
					}
				}
				if (verify)
					await this.userRepository.update(User.uuid, {friends: removeBlocked});
			}
			removeBlocked = [];
			verify = false;
			if (User.friendsNotacceptedYet)
			{
				for (let i = 0; User.friendsNotacceptedYet[i] ; i++) {
					if (User.friendsNotacceptedYet[i].uuid === uuid)
					{
						removeBlocked = User.friendsNotacceptedYet;
						removeBlocked.splice(i, 1);
						verify = true;
					}
				}
				if (verify)
					await this.userRepository.update(User.uuid, {friendsNotacceptedYet: removeBlocked});
			}
			removeBlocked = [];
			verify = false;
			if (User.friendRequest)
			{
				for (let i = 0; User.friendRequest[i] ; i++) {
					if (User.friendRequest[i].uuid === uuid)
					{
						removeBlocked = User.friendRequest;
						removeBlocked.splice(i, 1);
						verify = true;
					}
				}
				if (verify)
					await this.userRepository.update(User.uuid, {friendRequest: removeBlocked});
			}
			removeBlocked = [];
			verify = false;
			if (find.friendRequest)
			{
				for (let i = 0; find.friendRequest[i] ; i++) {
					if (find.friendRequest[i].uuid === User.uuid)
					{
						removeBlocked = find.friendRequest;
						removeBlocked.splice(i, 1);
						verify = true;
					}
				}
				if (verify)
					await this.userRepository.update(uuid, {friendRequest: removeBlocked});
			}
			removeBlocked = [];
			verify = false;
			if (find.friendsNotacceptedYet)
			{
				for (let i = 0; find.friendsNotacceptedYet[i] ; i++) {
					if (find.friendsNotacceptedYet[i].uuid === User.uuid)
					{
						removeBlocked = find.friendsNotacceptedYet;
						removeBlocked.splice(i, 1);
						verify = true;
					}
				}
				if (verify)
					await this.userRepository.update(uuid, {friendsNotacceptedYet: removeBlocked});
			}
			return (1);
		}
		return (0);
	}

	async removeFriendByUuid(uuid: string, User : UserModel) {
		const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
		if (find)
		{
			if (uuid === User.uuid)
				return (2)
			if (User.friends)
			{
				let i : number = 0;
				for (i = 0; User.friends[i] ; i++) {
					if (User.friends[i].uuid === uuid)
					{
						let removeFriend : Ifriends[] = [];
						let verify : boolean = false
						if (find.friends)
						{
							for (let j = 0; find.friends[j] ; j++) {
								if (find.friends[j].uuid === User.uuid)
								{
									removeFriend = find.friends;
									removeFriend.splice(j, 1);
									verify = true;
								}
							}
							if (verify)
								await this.userRepository.update(uuid, {friends: removeFriend});
						}
						removeFriend = [];
						if (User.friends)
						{
							removeFriend = User.friends;
							removeFriend.splice(i, 1);
							await this.userRepository.update(User.uuid, {friends: removeFriend});
						}
						return (1);
					}
				}
				return (3);
			}
			return (4);
		}
		return (0);
	}

	async cancelFriendAddByUuid(uuid: string, User : UserModel) {
		const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
		if (find)
		{
			if (uuid === User.uuid)
				return (2)
			if (User.friendsNotacceptedYet)
			{
				let i : number = 0;
				for (i = 0; User.friendsNotacceptedYet[i] ; i++) {
					if (User.friendsNotacceptedYet[i].uuid === uuid)
					{
						let removeFriend : Ifriends[] = [];
						let verify : boolean = false
						if (find.friendRequest)
						{
							for (let j = 0; find.friendRequest[j] ; j++) {
								if (find.friendRequest[j].uuid === User.uuid)
								{
									removeFriend = find.friendRequest;
									removeFriend.splice(j, 1);
									verify = true;
								}
							}
							if (verify)
								await this.userRepository.update(uuid, {friendRequest: removeFriend});
						}
						removeFriend = [];
						if (User.friendsNotacceptedYet)
						{
							removeFriend = User.friendsNotacceptedYet;
							removeFriend.splice(i, 1);
							await this.userRepository.update(User.uuid, {friendsNotacceptedYet: removeFriend});
						}
						return (1);
					}
				}
				return (3);
			}
			return (4);
		}
		return (0);
	}

	async unblockUserByUuid(uuid: string, User : UserModel) {
		const find = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
		if (find)
		{
			if (uuid === User.uuid)
				return (2)
			let verify : boolean = false;
			if (User.blocked)
			{
				for (let i = 0; User.blocked[i] ; i++) {
					if (User.blocked[i].uuid === uuid)
					{
						let blockedList : Ifriends[] = User.blocked;
						blockedList.splice(i, 1);
						await this.userRepository.update(User.uuid, {blocked : blockedList});
						verify = true;
					}
				}
			}

			if (!verify)
				return (3);
			
			if (find.blockedby)
			{
				for (let i = 0; find.blockedby[i] ; i++) {
					if (find.blockedby[i].uuid === User.uuid)
					{
						let blockedByList : Ifriends[] = find.blockedby;
						blockedByList.splice(i, 1);
						await this.userRepository.update(uuid, {blockedby : blockedByList});
						verify = true;
					}
				}
			}
			if (!verify)
				return (3);

			return (1);
		}
		return (0);
	}

  async findUserByUsername(username : string , UserUuid : string) {
	const find = await this.userRepository.find();
	let i : number = 0;
	const tabsearch = [];
	while (find[i])
	{
		if (find[i].username.includes(username))
			if (!(find[i].uuid === UserUuid))
				tabsearch.push(find[i].uuid)
		i++;
	}
  	return (tabsearch);
}

  async ChangeUsername(uuid : string, newName : string) {
	const alreadyexist = await this.userRepository.find({where : {username : newName}});
	if (alreadyexist[0])
		return (0);
	const user = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
	if (user)
	{
		await this.userRepository.update({uuid}, {username : newName});
		return (1);
	}
	return (0);
  }

  async ChangeAvatar(uuid : string , newAvatar : string) {
	const user = ((await this.userRepository.find()).filter(user => user.uuid === uuid))[0];
	if (user)
	{
		await this.userRepository.update({uuid}, {image : newAvatar});
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

//   async getMyUser(userId: any) : Promise<UserModel> {
// 	const findUser = (await this.userRepository.find({ where: { id: userId} }));
// 	if (findUser[0])
// 		return (findUser[0]);
// 	return ;
//   }
}