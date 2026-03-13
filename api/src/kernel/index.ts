/* eslint-disable import/no-dynamic-require */
import { join } from 'path';

export * from './common';
export * from './events';
export * from './exceptions';
export * from './helpers';
export * from './infras';
export * from './models';

export function getConfig(configName = 'app') {
  // eslint-disable-next-line global-require
  return require(join(__dirname, '..', 'config', configName)).default;
}
