import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';

import { subscriptionPackageSchema } from '../schemas';
import { SubscriptionSchema } from '../schemas/subscription.schema';

export const SUBSCRIPTION_MODEL_PROVIDER = 'SUBSCRIPTION_MODEL_PROVIDER';
export const SUBSCRIPTION_PACKAGE_MODEL_PROVIDER = 'SUBSCRIPTION_PACKAGE_MODEL_PROVIDER';

export const subscriptionProviders = [
  {
    provide: SUBSCRIPTION_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('UserSubscription', SubscriptionSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: SUBSCRIPTION_PACKAGE_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('SubscriptionPackage', subscriptionPackageSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
