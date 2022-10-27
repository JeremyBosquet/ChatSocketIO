import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { IChannelUser } from '../Interfaces/User';

@Entity({name: "channels"})
export class Channel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({type: 'jsonb'})
    owner: IChannelUser; // Iuser

    @Column()
    visibility: string;

    @Column({nullable: true})
    password: string; // mp/room
    
    @Column({type: 'jsonb'})
    users: any;
    
    @Column({type: 'jsonb'})
    messages: any;

    @Column({type: 'jsonb'})
    mutes: any;

    @Column({type: 'jsonb'})
    bans: any;

    @CreateDateColumn()
    createdAt: Date;

}