import { UUIDVersion } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Exclude, Expose } from 'class-transformer';

export interface Ifriends {
  uuid: string;
}

export interface ILogStatus {
	token: string;
  }

@Entity({ name: 'users' })
export class UserModel {
  @PrimaryGeneratedColumn('uuid')
  @Expose()
  uuid: string;

  @Column()
  @Expose()
  username: string;

  @Column()
  @Expose()
  trueUsername: string;

  @Column()
  @Expose()
  image: string;

  @Column()
  @Expose()
  id: number;

  @Column({ nullable: true })
  @Exclude()
  twoFactorAuthenticationSecret: string;

  @Column({ default: false })
  @Expose()
  isSecondFactorAuthenticated: boolean;

  @Column({ default: false })
  @Expose()
  public isTwoFactorAuthenticationEnabled: boolean;

  @Column({ nullable: true, type: 'jsonb' })
  @Expose()
  isLoggedIn: ILogStatus[];

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @Column({ nullable: true, type: 'jsonb' })
  @Exclude()
  friendRequest: Ifriends[];

  @Column({ nullable: true, type: 'jsonb' })
  @Exclude()
  friendsNotacceptedYet: Ifriends[];

  @Column({ nullable: true, type: 'jsonb' })
  @Exclude()
  friends: Ifriends[];

  @Column({ nullable: true, type: 'jsonb' })
  @Exclude()
  blocked: Ifriends[];

  @Column({ nullable: true, type: 'jsonb' })
  @Exclude()
  blockedby: Ifriends[];

  @Column({type: "decimal", precision: 10, scale: 2, default: 0.00})  
  @Expose()
  exp: number;
}