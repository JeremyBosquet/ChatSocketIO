import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';
import { IPlayers } from '../Interfaces/Players';


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

    @CreateDateColumn()
    createdAt: Date;
}