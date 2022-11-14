import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { IBall } from '../Interfaces/Ball';
import { IPlayers } from '../Interfaces/Players';
import { ISettings } from '../Interfaces/Settings';

interface IConfiguration {
  difficulty: string;
  background: string;
  confirmed: boolean;
}

@Entity({ name: 'rooms' })
export class Room {
  @PrimaryGeneratedColumn('uuid')
  @Exclude()
  id: string;

  @Column()
  @Exclude()
  name: string;

  @Column()
  @Exclude()
  nbPlayers: number;

  @Column()
  @Exclude()
  owner: string;

  @Column()
  status: string;

  @Column({ nullable: true, type: 'jsonb' })
  playerA: IPlayers;

  @Column({ nullable: true, type: 'jsonb' })
  playerB: IPlayers;

  @Column({ nullable: true, type: 'jsonb' })
  @Exclude()
  ball: IBall;

  @Column({ nullable: true, type: 'jsonb' })
  @Exclude()
  settings: ISettings;

  @Column({ nullable: true, type: 'jsonb' })
  @Exclude()
  configurationA: IConfiguration;

  @Column({ nullable: true, type: 'jsonb' })
  @Exclude()
  configurationB: IConfiguration;

  @Column({ nullable: true, type: 'bigint' })
  @Exclude()
  lastActivity: number;
  
  //@Column({type: ''})
  //createdAt: Date;
}
