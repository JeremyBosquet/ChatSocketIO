import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomGateway } from './room.gateway';
import { Room } from './Entities/room.entity';
import { UsersService } from 'src/Users/users.service';
import { UserModel } from 'src/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Room, UserModel]), ScheduleModule.forRoot(),],
  controllers: [RoomController], 
  providers: [RoomGateway, RoomService, UsersService, JwtService],
})

export class RoomModule {}
