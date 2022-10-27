import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity({name: "Authmodel"})
export class AuthModel {

    @Column()
    userUuid : string;

    @Column()
    isSecondFactorAuthenticated: boolean;


}