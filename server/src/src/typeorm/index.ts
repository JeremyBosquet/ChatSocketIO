import { Channel } from 'src/Chat/Entities/channel.entity';
import { Room } from 'src/Game/Entities/room.entity';
import { UserModel } from './user.entity';
import { DM } from 'src/Chat/Entities/dm.entity';

const entities = [UserModel, Channel, Room, DM];

export { UserModel };
export default entities;
