import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SectionsService } from './sections.service';
import { Section } from './section.entity';

describe('SectionsService', () => {
  let service: SectionsService;
  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: getRepositoryToken(Section), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(SectionsService);
    jest.clearAllMocks();
  });

  it('lists all sections ordered by key', async () => {
    mockRepo.find.mockResolvedValue([{ key: 'hero' }]);
    const result = await service.findAll();
    expect(result).toEqual([{ key: 'hero' }]);
    expect(mockRepo.find).toHaveBeenCalledWith({ order: { key: 'ASC' } });
  });

  it('throws NotFoundException for an unknown key', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it("updates a section's data and updatedBy", async () => {
    const existing = { key: 'hero', data: { title: 'old' }, updatedBy: null };
    mockRepo.findOne.mockResolvedValue(existing);
    mockRepo.save.mockImplementation((s: unknown) => Promise.resolve(s));

    const result = await service.update('hero', { title: 'new' }, 'admin@aliaflow.com');

    expect(result.data).toEqual({ title: 'new' });
    expect(result.updatedBy).toBe('admin@aliaflow.com');
  });
});
