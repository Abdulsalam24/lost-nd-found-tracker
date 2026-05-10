import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { ImageAsset } from '../items/entities/image-asset.entity';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(ImageAsset)
    private imageRepo: Repository<ImageAsset>,
  ) {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_ENDPOINT', ''),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY', ''),
      },
    });
    this.bucket = this.configService.get<string>('R2_BUCKET', 'lostfound');
  }

  async upload(
    file: Express.Multer.File,
    itemReportId: string,
    userId: string,
  ): Promise<ImageAsset> {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, and WEBP images are allowed');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const fileId = uuidv4();
    const ext = file.mimetype.split('/')[1];
    const objectKey = `items/${itemReportId}/${fileId}.${ext}`;
    const thumbnailKey = `items/${itemReportId}/${fileId}_thumb.${ext}`;

    const checksum = createHash('sha256').update(file.buffer).digest('hex');

    // Upload original
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // Generate and upload thumbnail
    const thumbnail = await sharp(file.buffer)
      .resize(300, 300, { fit: 'inside' })
      .toBuffer();

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: file.mimetype,
      }),
    );

    const asset = this.imageRepo.create({
      item_report_id: itemReportId,
      object_key: objectKey,
      thumbnail_key: thumbnailKey,
      mime_type: file.mimetype,
      file_size_bytes: file.size,
      checksum,
      uploaded_by: userId,
    });

    return this.imageRepo.save(asset);
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async deleteItemImages(itemReportId: string): Promise<void> {
    const assets = await this.imageRepo.find({
      where: { item_report_id: itemReportId },
    });

    const deletePromises = assets.map(async (asset) => {
      await this.deleteObject(asset.object_key);
      await this.deleteObject(asset.thumbnail_key);
    });

    await Promise.all(deletePromises);
    await this.imageRepo.delete({ item_report_id: itemReportId });
  }
}
