import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './section.entity';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section) private readonly sectionsRepository: Repository<Section>,
  ) {}

  findAll(): Promise<Section[]> {
    return this.sectionsRepository.find({ order: { key: 'ASC' } });
  }

  async findOne(key: string): Promise<Section> {
    const section = await this.sectionsRepository.findOne({ where: { key } });
    if (!section) {
      throw new NotFoundException(`Section "${key}" not found`);
    }
    return section;
  }

  async update(key: string, data: Record<string, unknown>, updatedBy: string): Promise<Section> {
    const section = await this.findOne(key);
    section.data = data;
    section.updatedBy = updatedBy;
    return this.sectionsRepository.save(section);
  }
}
