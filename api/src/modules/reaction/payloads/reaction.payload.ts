import {
  IsIn, IsNotEmpty, IsOptional, IsString
} from 'class-validator';

import { REACTION, REACTION_TYPE } from '../constants';

export class ReactionCreatePayload {
  @IsString()
  @IsOptional()
    objectType = REACTION_TYPE.VIDEO;

  @IsString()
  @IsOptional()
  @IsIn([
    REACTION.LIKE,
    REACTION.FAVOURITE,
    REACTION.WATCH_LATER
  ])
    action: string;

  @IsString()
  @IsNotEmpty()
    objectId: string;
}
