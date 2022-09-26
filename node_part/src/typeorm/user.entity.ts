import { UUIDVersion } from 'class-validator';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity({name: "users"})
export class UserModel {

    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    username: string;

    @Column()
    image: string;

	@Column()
	id : number;

    @CreateDateColumn()
    createdAt: Date;
}