import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoomController } from "./room.controller";
import { RoomService } from "./room.service";
import { RoomGateway } from "./room.gateway";
import { Room } from "./Entities/room.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Room]),
    ],
    controllers: [RoomController],
    providers: [RoomService, RoomGateway],
})
export class RoomModule{}