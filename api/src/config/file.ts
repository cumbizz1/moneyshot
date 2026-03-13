import { join } from 'path';

export default {
  publicDir: join(__dirname, '..', '..', 'public'),
  avatarDir: join(__dirname, '..', '..', 'public', 'avatars', 'files'),
  coverDir: join(__dirname, '..', '..', 'public', 'covers', 'files'),
  settingDir: join(__dirname, '..', '..', 'public', 'settings', 'files'),
  imageDir: join(__dirname, '..', '..', 'public', 'images', 'files'), // common images here
  // protected dir
  documentDir: join(__dirname, '..', '..', 'public', 'documents'),
  // public dir
  videoDir: join(__dirname, '..', '..', 'public', 'videos', 'files'),
  // protected with auth and some permissions, will check via http-auth-module
  videoProtectedDir: join(
    __dirname,
    '..',
    '..',
    'public',
    'videos',
    'protected'
  ),
  // store performer photo here?
  photoDir: join(__dirname, '..', '..', 'public', 'photos', 'files'),
  // protected dir
  photoProtectedDir: join(
    __dirname,
    '..',
    '..',
    'public',
    'photos',
    'protected'
  ),
  // protected dir
  digitalProductDir: join(
    __dirname,
    '..',
    '..',
    'public',
    'digital-products',
    'protected'
  ),
  ftpFileDir: join(__dirname, '..', '..', 'public', 'files')
};
