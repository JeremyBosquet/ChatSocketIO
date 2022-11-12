import { isUUID } from 'class-validator';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity({name: "dms"})
export class DM {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'jsonb'})
    users: any;
    
    @Column({type: 'jsonb'})
    messages: any;

    @CreateDateColumn()
    createdAt: Date;

}