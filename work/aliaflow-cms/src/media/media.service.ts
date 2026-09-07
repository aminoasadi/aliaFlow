import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Media } from './media.entity';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private readonly mediaRepository: Repository<Media>,
  ) {}

  async create(file: Express.Multer.File): Promise<Media> {
    const media = this.mediaRepository.create({
      filename: file.filename,
      url: `/media/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    });
    return this.mediaRepository.save(media);
  }

  findAll(): Promise<Media[]> {
    return this.mediaRepository.find({ order: { createdAt: 'DESC' } });
  }

  async remove(id: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException(`Media "${id}" not found`);
    }
    await this.mediaRepository.remove(media);
    await unlink(join(UPLOADS_DIR, media.filename)).catch(() => undefined);
  }
}
