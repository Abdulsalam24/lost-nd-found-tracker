import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { ImageAsset } from '../items/entities/image-asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImageAsset])],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
