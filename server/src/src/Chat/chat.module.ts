import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelController } from "./channel.controller";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { DMsController } from "./dms.controller";
import { DMsService } from "./dms.service";
import { Channel } from "./Entities/channel.entity";
import { DM } from "./Entities/dm.entity";
import { UserModel } from "src/typeorm";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Channel, UserModel, DM]),
    ],
    controllers: [ChatController, ChannelController, DMsController],
    providers: [JwtService, UsersService, ChatService, DMsService, ChatGateway],
})
export class ChatModule{}