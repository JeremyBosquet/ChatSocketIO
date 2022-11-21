import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomGateway } from './room.gateway';
import { Room } from './Entities/room.entity';
import { UsersService } from 'src/users/users.service';
import { UserModel } from 'src/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Room, UserModel])],
  controllers: [RoomController],
  providers: [RoomService, RoomGateway, UsersService],
})
export class RoomModule {}
