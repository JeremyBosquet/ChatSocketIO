import { UUIDVersion } from 'class-validator';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

import { Exclude, Expose } from 'class-transformer';

@Entity({name: "users"})
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
	id : number;

	@Column()
	@Exclude()
	twoFactorAuthenticationSecret: string;

	@Column({ default: false })
	@Expose()
    isSecondFactorAuthenticated: boolean;

	@Column({ default: false })
	@Expose()
  	public isTwoFactorAuthenticationEnabled: boolean;

	@Column({ default: false })
	@Expose()
	isLoggedIn : boolean;

    @CreateDateColumn()
	@Exclude()
    createdAt: Date;
}