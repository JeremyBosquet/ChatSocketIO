import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity({name: "messages"})
export class Chat {

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    userId: string;

    @Column()
    message: string;

    @Column()
    channelId: string;

    @Column()
    date: string;

    // @Column()
    // to: string;

    // @Column()
    // type: string; // mp/room

    @CreateDateColumn()
    createdAt: Date;

}