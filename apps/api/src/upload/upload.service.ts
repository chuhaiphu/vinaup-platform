import { promises as fs } from 'fs';
import { join } from 'path';

import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import {
  UploadFileNotFoundException,
  UploadFileRequiredException,
  UploadFileTooLargeException,
  UploadInvalidFileTypeException,
  UploadPathRequiredException,
} from 'src/_common/exceptions/upload.exception';
import { generateUniqueCode } from 'src/_common/utils/generator/string-generator/generate-unique-code';
import uploadConfig from 'src/_core/configs/upload.config';

import type { UploadImageResponse } from './dtos/upload-image.response.dto';

@Injectable()
export class UploadService {
  constructor(
    @Inject(uploadConfig.KEY)
    private readonly config: ConfigType<typeof uploadConfig>,
  ) { }

  async uploadImage(file: Express.Multer.File, filePath: string, folderPath: string) {
    // Create folder and save file
    await fs.mkdir(folderPath, { recursive: true });
    await fs.writeFile(filePath, file.buffer);
  }

  async uploadImageByCurrentUser(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadImageResponse> {
    // Validate
    if (!file) throw new UploadFileRequiredException();
    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      throw new UploadInvalidFileTypeException();
    }
    if (file.size > this.config.maxFileSize) {
      throw new UploadFileTooLargeException();
    }

    // Generate filename
    const ext = file.originalname.split('.').pop() || 'jpg';
    const filename = `${generateUniqueCode()}.${ext}`;

    // Create paths
    const folder = `user_${userId}`;
    const folderPath = join(this.config.uploadPath, folder);
    const filePath = join(folderPath, filename);
    await this.uploadImage(file, filePath, folderPath)

    return {
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${this.config.mediaBaseUrl}/${folder}/${filename}`,
      path: `${folder}/${filename}`,
      uploadedAt: new Date().toISOString(),
    };
  }

  async deleteFile(relativePath: string): Promise<void> {
    if (!relativePath) throw new UploadPathRequiredException();
    const filePath = join(this.config.uploadPath, relativePath);
    try {
      await fs.unlink(filePath);
    }
    catch (error) {
      if (error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new UploadFileNotFoundException();
      }
    }
  }
}