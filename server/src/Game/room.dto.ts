import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  minLength,
  MinLength,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { IPlayers } from './Interfaces/Players';
import { IBall } from './Interfaces/Ball';
import { ISettings } from './Interfaces/Settings';

interface IConfiguration {
  difficulty: string;
  background: string;
  confirmed: boolean;
}

export class SendGameHistoryDto {
  @IsNotEmpty()
  @Expose()
  playerA: IPlayers;

  @IsNotEmpty()
  @Expose()
  playerB: IPlayers;

  @IsNotEmpty()
  @IsString()
  @Expose()
  status: string;

  @Exclude()
  id: string;
  @Exclude()
  name: string;
  @Exclude()
  owner: string;
  @Exclude()
  nbPlayer: number;
  @Exclude()
  createdAt: string;

  @Exclude()
  nbPlayers: number;

  @Exclude()
  ball: IBall;

  @Exclude()
  settings: ISettings;

  @Exclude()
  configurationA: IConfiguration;

  @Exclude()
  configurationB: IConfiguration;

  @Exclude()
  lastActivity: number;
}
