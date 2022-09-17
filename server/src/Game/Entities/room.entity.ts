import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { IBall } from '../Interfaces/Ball';
import { IPlayers } from '../Interfaces/Players';
import { ISettings } from '../Interfaces/Settings';

@Entity({name: "rooms"})
export class Room {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    nbPlayers: number;

    @Column()
    owner: string;

    @Column()
    status: string;

    @Column({nullable: true, type: 'jsonb'})
    playerA: IPlayers;

    @Column({nullable: true, type: 'jsonb'})
    playerB: IPlayers;

    @Column({nullable: true, type: 'jsonb'})
    ball: IBall;

    @Column({nullable: true, type: 'jsonb'})
    settings: ISettings;

    @CreateDateColumn()
    createdAt: Date;
}