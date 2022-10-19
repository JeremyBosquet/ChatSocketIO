import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from './login/login.module';
import { UserModel } from './typeorm/user.entity';
import entities from './typeorm';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { join } from 'path/posix';
import { string } from 'joi';
import { UsersService } from './users/users.service';
import { AppService } from './app.service';
import { JwtStrategy } from './login/jwt.strategy';
import { twoAuthModule } from './2auth/twoFactorAuthentication.module';
import { JwtTwoFactorStrategy } from './2auth/auth.strategy';
import { Chat } from './Chat/Entities/chat.entity';
import { ChatModule } from './Chat/chat.module';
import { Channel } from './Chat/Entities/channel.entity';
import { User } from './Chat/Entities/user.entity';
import { RoomModule } from './Game/room.module';
import { Room } from './Game/Entities/room.entity';
import { RoomGateway } from './Game/room.gateway';
import { RoomService } from './Game/room.service';

@Module({
  imports: [
	ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRootAsync({
		imports: [ConfigModule],
		useFactory: (configService: ConfigService) => ({
			type: 'postgres',
			host: configService.get('DB_HOST'),
			port: +configService.get<number>('DB_PORT'),
			username: configService.get('DB_USER'),
			password: configService.get('DB_PASS'),
			database: configService.get('DB_NAME'),
			entities: entities,
			synchronize: true,
			
		}),
		inject: [ConfigService],
	}),
	TypeOrmModule.forFeature([UserModel, Chat, Channel, User]),
	JwtModule.registerAsync({
		imports: [ConfigModule],
		useFactory: async (configService: ConfigService) => ({
			secret: configService.get('JWT_SECRET') ,
		}),
		inject: [ConfigService],
	}),
	ServeStaticModule.forRoot({
		rootPath: join(__dirname, '..', 'src/uploads/avatar'),
	  }),
	LoginModule,
	UsersModule,
	HttpModule,
	twoAuthModule,
  ChatModule,
  RoomModule,
  ],
  controllers: [AppController],
  providers: [UsersService, AppService, JwtStrategy, JwtTwoFactorStrategy],
//   exports: [AppService],
})

export class AppModule {}
