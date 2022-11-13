import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelController } from "./channel.controller";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { DMsController } from "./dms.controller";
import { DMsService } from "./dms.service";
import { Channel } from "./Entities/channel.entity";
import { User } from "./Entities/user.entity";
import { DM } from "./Entities/dm.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Channel, User, DM]),
    ],
    controllers: [ChatController, ChannelController, DMsController],
    providers: [ChatService, DMsService, ChatGateway],
})
export class ChatModule{}