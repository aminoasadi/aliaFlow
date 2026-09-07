import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = { findByEmail: jest.fn() } as unknown as UsersService;
  const jwtService = { sign: jest.fn().mockReturnValue('signed-token') } as unknown as JwtService;

  beforeEach(() => {
    service = new AuthService(usersService, jwtService);
    jest.clearAllMocks();
  });

  it('returns an access token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: '1', email: 'admin@aliaflow.com', passwordHash });

    const result = await service.login('admin@aliaflow.com', 'correct-password');

    expect(result).toEqual({ accessToken: 'signed-token' });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: '1', email: 'admin@aliaflow.com' });
  });

  it('throws UnauthorizedException for a wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: '1', email: 'admin@aliaflow.com', passwordHash });

    await expect(service.login('admin@aliaflow.com', 'wrong-password')).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for an unknown email', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(service.login('nobody@aliaflow.com', 'anything')).rejects.toThrow(UnauthorizedException);
  });
});
