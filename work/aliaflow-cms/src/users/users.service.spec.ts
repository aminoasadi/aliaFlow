import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(UsersService);
    jest.clearAllMocks();
  });

  it('finds a user by email', async () => {
    mockRepo.findOne.mockResolvedValue({ id: '1', email: 'a@b.com', passwordHash: 'x' });
    const user = await service.findByEmail('a@b.com');
    expect(user?.email).toBe('a@b.com');
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
  });

  it('creates a user with a hashed password', async () => {
    mockRepo.create.mockReturnValue({ email: 'a@b.com', passwordHash: 'hashed' });
    mockRepo.save.mockResolvedValue({ id: '1', email: 'a@b.com', passwordHash: 'hashed' });
    const user = await service.create('a@b.com', 'hashed');
    expect(mockRepo.create).toHaveBeenCalledWith({ email: 'a@b.com', passwordHash: 'hashed' });
    expect(user.id).toBe('1');
  });
});
