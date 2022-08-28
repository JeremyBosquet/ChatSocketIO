import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './Chat/Entities/chat.entity';
import { ChatModule } from './Chat/chat.module';
import { Channel } from './Chat/Entities/channel.entity';
import { User } from './Chat/Entities/user.entity';
import { RoomModule } from './Game/room.module';
import { Room } from './Game/Entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      username: 'jeremy',
      password: 'jeremy',
      database: 'chat',
      entities: [Chat, Channel, User, Room],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Chat, Channel, User]),
    ChatModule, RoomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
