import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity({name: "Authmodel"})
export class AuthModel {

    @Column()
    userId : number;

    @Column()
    isSecondFactorAuthenticated: boolean;


}