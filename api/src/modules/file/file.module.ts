import { forwardRef, Module } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';

import { AuthModule } from '../auth/auth.module';
import { FileController } from './controllers/file.controller';
import { fileProviders } from './providers';
import {
  AudioFileService, FileService, ImageService, VideoFileService
} from './services';

@Module({
  imports: [
    MongoDBModule,
    forwardRef(() => AuthModule)
  ],
  providers: [
    ...fileProviders,
    FileService,
    ImageService,
    VideoFileService,
    AudioFileService],
  controllers: [FileController],
  exports: [
    ...fileProviders,
    FileService]
})
export class FileModule { }
