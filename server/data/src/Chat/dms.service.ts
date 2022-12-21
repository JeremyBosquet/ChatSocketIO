import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserModel } from "src/typeorm";
import { Repository } from "typeorm";
import { DM } from "./Entities/dm.entity";
import { User } from "./Entities/user.entity";
import { IChat } from "./Interfaces/Chat";

@Injectable()
export class DMsService {
  constructor(
      @InjectRepository(UserModel) private userRepository: Repository<UserModel>, 
      @InjectRepository(DM) private dmsRepository: Repository<DM>, 
    ) {}

    async createMessage(chat: IChat, dmId: string): Promise<void> {
      const dm = await this.dmsRepository.findOneBy({id: dmId});
      if (dm) {
        dm.messages.push(chat);
      await this.dmsRepository.update(dmId, dm);
      }
    }

    async getDMsWhereUser(userId: string): Promise<any> {
      function containsPlayer(users : User[]) {
        const containsUser = users.filter(user => user.id === userId);

        if (Object.keys(containsUser).length == 0)
          return false;
        return true;
      }
      
      const dms = await this.dmsRepository.find();
      return (dms?.filter(channel => containsPlayer(channel.users) === true));
    }

    async getDm(dmId : string): Promise<any> {
      let dmsInfos : DM;
      dmsInfos = await this.dmsRepository.findOneBy({id: dmId});
      if (dmsInfos)
        dmsInfos.users = await this.getUsersInfosInDm(dmId);
      else
        return [];

      return dmsInfos
    }

    async getAndCreateDmWhereTwoUser(user1 : string, user2 : string): Promise<any> {
      const dms = await this.getDMsWhereUser(user1);

      for (const dm of dms) {
        if (dm.users.length == 2) {
          for (const user of dm.users) {
            if (user.id == user2)
              return dm;
          }
        }
      }

      const newDm : DM = this.dmsRepository.create({users: [{id: user1}, {id: user2}], messages: []});
      await this.dmsRepository.save(newDm);
      return (await this.getAndCreateDmWhereTwoUser(user1, user2));
    }

    async getUser(userId: string): Promise<UserModel> {
      return await this.userRepository.findOneBy({uuid: userId});
    }

    async getUsersInfosInDm(dmId: string): Promise<any> {
      const dm = await this.dmsRepository.findOneBy({id: dmId});

      let users = [];
      if (dm?.users) {
        for (const user of dm.users) {
          let userInfos : any = await this.getUser(user.id);
          let filteredUserInfos = {
            uuid: userInfos.uuid,
            username: userInfos.username,
            image: userInfos.image,
            trueUsername: userInfos.trueUsername
          }
          users.push(filteredUserInfos);
        }
      }

      return users;
    }

    async userIsInChannel(dmId: string, userId: string): Promise<Boolean> {
      const dm = await this.dmsRepository.findOneBy({id: dmId});

      const checkUserIsIn = async (dm: any) => {
        const containsUser = await dm.users.filter(user => user.id === userId);
        if (Object.keys(containsUser).length == 0)
            return false;
        return true;
      }

      return (dm && checkUserIsIn(dm));
    }

    async getMessageFromDm(channelId: string): Promise<IChat[]> {
      return (await this.dmsRepository.findOneBy({id: channelId}))?.messages;
    }

}