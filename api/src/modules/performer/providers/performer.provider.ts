import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';

import {
  PerformerSchema
} from '../schemas';

export const PERFORMER_MODEL_PROVIDER = 'PERFORMER_MODEL';

export const performerProviders = [
  {
    provide: PERFORMER_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Performer', PerformerSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
