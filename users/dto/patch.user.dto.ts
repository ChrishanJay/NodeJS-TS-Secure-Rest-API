import { PutUserDTO } from './put.user.dto';

export interface PatchUserDTO extends Partial<PutUserDTO> { }