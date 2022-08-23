import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

interface Iuser {
    id: string;
    name: string;
    role: string;
}

@Entity()
export class Channel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({type: 'simple-array'})
    owner: Iuser; // Iuser

    @Column()
    visibility: string;

    @Column({nullable: true})
    password: string; // mp/room

    @Column({type: 'simple-array'})
    users: Iuser[];

    @CreateDateColumn()
    createdAt: Date;

}