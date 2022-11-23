import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  minLength,
  MinLength,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { IPlayers } from './Interfaces/Players';
import { IBall } from './Interfaces/Ball';
import { ISettings } from './Interfaces/Settings';
import { isBigInt64Array } from 'util/types';

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
  @Expose()
  name: string;
  @Exclude()
  owner: string;
  @Exclude()
  nbPlayer: number;

  //@IsNotEmpty()
  //@IsDate()
  //@Expose()
  //createdAt: string;

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

  @Expose()
  scoreA: number;

  @Expose()
  scoreB: number;

  @IsNumber()
  @Expose()
  lastActivity: number;
}
