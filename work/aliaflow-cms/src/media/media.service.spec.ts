import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { Media } from './media.entity';

jest.mock('fs/promises', () => ({ unlink: jest.fn().mockResolvedValue(undefined) }));

describe('MediaService', () => {
  let service: MediaService;
  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: getRepositoryToken(Media), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(MediaService);
    jest.clearAllMocks();
  });

  it('creates a media record from an uploaded file', async () => {
    const file = { filename: 'abc.png', mimetype: 'image/png', size: 1234 } as Express.Multer.File;
    mockRepo.create.mockReturnValue({ filename: 'abc.png', url: '/media/abc.png', mimetype: 'image/png', size: 1234 });
    mockRepo.save.mockResolvedValue({ id: '1', filename: 'abc.png', url: '/media/abc.png', mimetype: 'image/png', size: 1234 });

    const result = await service.create(file);

    expect(result.url).toBe('/media/abc.png');
  });

  it('throws NotFoundException when removing an unknown id', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});
