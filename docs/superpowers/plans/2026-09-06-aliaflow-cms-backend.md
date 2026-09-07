# Aliaflow CMS Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the NestJS CMS backend (`aliaflow-cms`) that stores and serves the Aliaflow landing page's content and media through an authenticated REST API.

**Architecture:** A single NestJS app with four feature modules (`users`, `auth`, `sections`, `media`) backed by Postgres via TypeORM. `Section` rows hold arbitrary JSONB content per landing-page section (hero, footer, nav, cards, team, etc.); `Media` rows track uploaded images stored on local disk. Reads of sections are public; writes (sections + media) require a JWT obtained via a single seeded admin account.

**Tech Stack:** NestJS, TypeORM + `pg` (Postgres), `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`, `@nestjs/swagger`, `bcrypt`, `class-validator`/`class-transformer`, `helmet`, `morgan`, `multer`, Jest.

## Global Constraints

- Project lives at `work/aliaflow-cms`, its own git repository.
- Single admin account only — no public registration endpoint, no roles beyond "admin".
- Content is modeled as flexible `Section` rows (`key` + JSONB `data`), not per-content-type tables.
- `GET /api/sections` and `GET /api/sections/:key` are public; every other endpoint requires a valid JWT.
- Media uploads: images only (`png`/`jpeg`/`webp`/`gif`), 5MB max, stored under `uploads/` and served statically at `/media/...`.
- Dependencies are exactly: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/swagger`, `@nestjs/typeorm`, `typeorm`, `pg`, `bcrypt`, `class-transformer`, `class-validator`, `helmet`, `morgan`, `multer`, `dotenv`, `reflect-metadata`, `rxjs` (no `axios`, no `@nestjs/config`).
- All service-layer logic gets Jest unit tests using mocked TypeORM repositories (no live DB required to run `npm test`).

---

### Task 1: Project scaffold, Postgres, and app bootstrap

**Files:**
- Create: `work/aliaflow-cms/package.json`
- Create: `work/aliaflow-cms/tsconfig.json`
- Create: `work/aliaflow-cms/tsconfig.build.json`
- Create: `work/aliaflow-cms/nest-cli.json`
- Create: `work/aliaflow-cms/.env.example`
- Create: `work/aliaflow-cms/.gitignore`
- Create: `work/aliaflow-cms/docker-compose.yml`
- Create: `work/aliaflow-cms/src/app.module.ts`
- Create: `work/aliaflow-cms/src/main.ts`

**Interfaces:**
- Produces: `AppModule` (imports `TypeOrmModule.forRoot(...)` plus feature modules added in later tasks), an executable app listening on `process.env.PORT ?? 4000` under the `/api` prefix, Swagger at `/docs`, static file serving of `uploads/` at `/media`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "aliaflow-cms",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "seed": "ts-node -r tsconfig-paths/register scripts/seed.ts",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/common": "^10.4.4",
    "@nestjs/core": "^10.4.4",
    "@nestjs/platform-express": "^10.4.4",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/swagger": "^7.4.0",
    "@nestjs/typeorm": "^10.0.2",
    "typeorm": "^0.3.20",
    "pg": "^8.12.0",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "dotenv": "^16.4.5",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.5",
    "@nestjs/schematics": "^10.1.4",
    "@nestjs/testing": "^10.4.4",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.13",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.12",
    "@types/node": "^20.14.15",
    "@types/passport-jwt": "^4.0.1",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.5.4"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": ".",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": false,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true
  }
}
```

- [ ] **Step 3: Create `tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
```

- [ ] **Step 4: Create `nest-cli.json`**

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
```

- [ ] **Step 5: Create `.env.example`**

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=aliaflow
DB_PASSWORD=aliaflow
DB_NAME=aliaflow_cms
JWT_SECRET=change-me
PORT=4000
ADMIN_ORIGIN=http://localhost:4001
ADMIN_EMAIL=admin@aliaflow.com
ADMIN_PASSWORD=change-me-please
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
dist/
uploads/*
!uploads/.gitkeep
.env
```

- [ ] **Step 7: Create `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: aliaflow
      POSTGRES_PASSWORD: aliaflow
      POSTGRES_DB: aliaflow_cms
    ports:
      - "5432:5432"
    volumes:
      - aliaflow_pgdata:/var/lib/postgresql/data

volumes:
  aliaflow_pgdata:
```

- [ ] **Step 8: Create `src/app.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'aliaflow',
      password: process.env.DB_PASSWORD ?? 'aliaflow',
      database: process.env.DB_NAME ?? 'aliaflow_cms',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
  ],
})
export class AppModule {}
```

(`autoLoadEntities: true` means every module registered later via `TypeOrmModule.forFeature([...])` gets picked up automatically — no need to edit this file again in later tasks.)

- [ ] **Step 9: Create `src/main.ts`**

```ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import morgan from 'morgan';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());
  app.use(morgan('combined'));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors({ origin: process.env.ADMIN_ORIGIN ?? 'http://localhost:4001' });
  app.setGlobalPrefix('api');
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/media' });

  const config = new DocumentBuilder()
    .setTitle('Aliaflow CMS')
    .setDescription('Content API for the Aliaflow landing site')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
```

- [ ] **Step 10: Create the uploads placeholder**

```bash
mkdir -p work/aliaflow-cms/uploads && touch work/aliaflow-cms/uploads/.gitkeep
```

- [ ] **Step 11: Install dependencies**

Run: `cd work/aliaflow-cms && npm install`
Expected: installs without errors, creates `package-lock.json`.

- [ ] **Step 12: Start Postgres and verify the app boots**

Run: `cd work/aliaflow-cms && docker compose up -d && cp .env.example .env && npm run start:dev`
Expected: log line `Nest application successfully started`. Visit `http://localhost:4000/docs` — Swagger UI loads (empty, no endpoints yet, since no feature modules are registered until later tasks). Stop with Ctrl+C.

- [ ] **Step 13: Init git and commit**

```bash
cd work/aliaflow-cms
git init
git add package.json tsconfig.json tsconfig.build.json nest-cli.json .env.example .gitignore docker-compose.yml src/app.module.ts src/main.ts uploads/.gitkeep
git commit -m "chore: scaffold aliaflow-cms NestJS project"
```

---

### Task 2: Users module

**Files:**
- Create: `work/aliaflow-cms/src/users/user.entity.ts`
- Create: `work/aliaflow-cms/src/users/users.service.ts`
- Create: `work/aliaflow-cms/src/users/users.service.spec.ts`
- Create: `work/aliaflow-cms/src/users/users.module.ts`

**Interfaces:**
- Consumes: nothing (first feature module).
- Produces: `User` entity (`id`, `email`, `passwordHash`); `UsersService.findByEmail(email: string): Promise<User | null>`; `UsersService.create(email: string, passwordHash: string): Promise<User>`; `UsersModule` exporting `UsersService`.

- [ ] **Step 1: Write the failing test**

Create `work/aliaflow-cms/src/users/users.service.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd work/aliaflow-cms && npx jest src/users/users.service.spec.ts`
Expected: FAIL — `Cannot find module './users.service'` (or `./user.entity`).

- [ ] **Step 3: Create `src/users/user.entity.ts`**

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;
}
```

- [ ] **Step 4: Create `src/users/users.service.ts`**

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const user = this.usersRepository.create({ email, passwordHash });
    return this.usersRepository.save(user);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd work/aliaflow-cms && npx jest src/users/users.service.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Create `src/users/users.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 7: Register `UsersModule` in `AppModule`**

Modify `work/aliaflow-cms/src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'aliaflow',
      password: process.env.DB_PASSWORD ?? 'aliaflow',
      database: process.env.DB_NAME ?? 'aliaflow_cms',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    UsersModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 8: Commit**

```bash
cd work/aliaflow-cms
git add src/users src/app.module.ts
git commit -m "feat: add users module with email lookup and creation"
```

---

### Task 3: Auth module (JWT login)

**Files:**
- Create: `work/aliaflow-cms/src/auth/dto/login.dto.ts`
- Create: `work/aliaflow-cms/src/auth/auth.service.ts`
- Create: `work/aliaflow-cms/src/auth/auth.service.spec.ts`
- Create: `work/aliaflow-cms/src/auth/strategies/jwt.strategy.ts`
- Create: `work/aliaflow-cms/src/auth/guards/jwt-auth.guard.ts`
- Create: `work/aliaflow-cms/src/auth/auth.controller.ts`
- Create: `work/aliaflow-cms/src/auth/auth.module.ts`
- Modify: `work/aliaflow-cms/src/app.module.ts`

**Interfaces:**
- Consumes: `UsersService.findByEmail` (Task 2).
- Produces: `JwtPayload` (`{ sub: string; email: string }`), `AuthService.login(email: string, password: string): Promise<{ accessToken: string }>` (throws `UnauthorizedException` on bad credentials), `JwtAuthGuard` (used by Sections/Media controllers in later tasks), `POST /api/auth/login`.

- [ ] **Step 1: Write the failing test**

Create `work/aliaflow-cms/src/auth/auth.service.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd work/aliaflow-cms && npx jest src/auth/auth.service.spec.ts`
Expected: FAIL — `Cannot find module './auth.service'`.

- [ ] **Step 3: Create `src/auth/auth.service.ts`**

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return null;
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd work/aliaflow-cms && npx jest src/auth/auth.service.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Create `src/auth/dto/login.dto.ts`**

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;
}
```

- [ ] **Step 6: Create `src/auth/strategies/jwt.strategy.ts`**

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret',
    });
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

- [ ] **Step 7: Create `src/auth/guards/jwt-auth.guard.ts`**

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- [ ] **Step 8: Create `src/auth/auth.controller.ts`**

```ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Returns a JWT access token' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
```

- [ ] **Step 9: Create `src/auth/auth.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

- [ ] **Step 10: Register `AuthModule` in `AppModule`**

Modify `work/aliaflow-cms/src/app.module.ts` — add the import and list it after `UsersModule`:

```ts
import { AuthModule } from './auth/auth.module';
// ...
    UsersModule,
    AuthModule,
```

- [ ] **Step 11: Commit**

```bash
cd work/aliaflow-cms
git add src/auth src/app.module.ts
git commit -m "feat: add JWT auth module with login endpoint"
```

---

### Task 4: Sections module (content API)

**Files:**
- Create: `work/aliaflow-cms/src/sections/section.entity.ts`
- Create: `work/aliaflow-cms/src/sections/dto/update-section.dto.ts`
- Create: `work/aliaflow-cms/src/sections/sections.service.ts`
- Create: `work/aliaflow-cms/src/sections/sections.service.spec.ts`
- Create: `work/aliaflow-cms/src/sections/sections.controller.ts`
- Create: `work/aliaflow-cms/src/sections/sections.module.ts`
- Modify: `work/aliaflow-cms/src/app.module.ts`

**Interfaces:**
- Consumes: `JwtAuthGuard` (Task 3).
- Produces: `Section` entity (`id`, `key`, `label`, `data: Record<string, unknown>`, `updatedAt`, `updatedBy`); `SectionsService.findAll()`, `.findOne(key: string)` (throws `NotFoundException`), `.update(key: string, data: Record<string, unknown>, updatedBy: string)`; `GET /api/sections`, `GET /api/sections/:key`, `PATCH /api/sections/:key` (guarded).

- [ ] **Step 1: Write the failing test**

Create `work/aliaflow-cms/src/sections/sections.service.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd work/aliaflow-cms && npx jest src/sections/sections.service.spec.ts`
Expected: FAIL — `Cannot find module './sections.service'`.

- [ ] **Step 3: Create `src/sections/section.entity.ts`**

```ts
import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  label: string;

  @Column({ type: 'jsonb' })
  data: Record<string, unknown>;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'updated_by', nullable: true, type: 'varchar' })
  updatedBy: string | null;
}
```

- [ ] **Step 4: Create `src/sections/sections.service.ts`**

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd work/aliaflow-cms && npx jest src/sections/sections.service.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Create `src/sections/dto/update-section.dto.ts`**

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpdateSectionDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  data: Record<string, unknown>;
}
```

- [ ] **Step 7: Create `src/sections/sections.controller.ts`**

```ts
import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SectionsService } from './sections.service';
import { UpdateSectionDto } from './dto/update-section.dto';

interface AuthedRequest extends Request {
  user: { userId: string; email: string };
}

@ApiTags('sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.sectionsService.findOne(key);
  }

  @Patch(':key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('key') key: string, @Body() dto: UpdateSectionDto, @Req() req: AuthedRequest) {
    return this.sectionsService.update(key, dto.data, req.user.email);
  }
}
```

- [ ] **Step 8: Create `src/sections/sections.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './section.entity';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Section])],
  providers: [SectionsService],
  controllers: [SectionsController],
})
export class SectionsModule {}
```

- [ ] **Step 9: Register `SectionsModule` in `AppModule`**

Modify `work/aliaflow-cms/src/app.module.ts` — add the import and list it after `AuthModule`:

```ts
import { SectionsModule } from './sections/sections.module';
// ...
    AuthModule,
    SectionsModule,
```

- [ ] **Step 10: Commit**

```bash
cd work/aliaflow-cms
git add src/sections src/app.module.ts
git commit -m "feat: add sections module for content CRUD"
```

---

### Task 5: Media module (image uploads)

**Files:**
- Create: `work/aliaflow-cms/src/media/media.entity.ts`
- Create: `work/aliaflow-cms/src/media/media.service.ts`
- Create: `work/aliaflow-cms/src/media/media.service.spec.ts`
- Create: `work/aliaflow-cms/src/media/media.controller.ts`
- Create: `work/aliaflow-cms/src/media/media.module.ts`
- Modify: `work/aliaflow-cms/src/app.module.ts`

**Interfaces:**
- Consumes: `JwtAuthGuard` (Task 3).
- Produces: `Media` entity (`id`, `filename`, `url`, `mimetype`, `size`, `createdAt`); `MediaService.create(file: Express.Multer.File)`, `.findAll()`, `.remove(id: string)` (throws `NotFoundException`); `POST /api/media`, `GET /api/media`, `DELETE /api/media/:id` (all guarded), files served statically at `/media/<filename>` (wired in Task 1's `main.ts`).

- [ ] **Step 1: Write the failing test**

Create `work/aliaflow-cms/src/media/media.service.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd work/aliaflow-cms && npx jest src/media/media.service.spec.ts`
Expected: FAIL — `Cannot find module './media.service'`.

- [ ] **Step 3: Create `src/media/media.entity.ts`**

```ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  mimetype: string;

  @Column()
  size: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

- [ ] **Step 4: Create `src/media/media.service.ts`**

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd work/aliaflow-cms && npx jest src/media/media.service.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Create `src/media/media.controller.ts`**

```ts
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

const UPLOADS_DIR = join(process.cwd(), 'uploads');
const ALLOWED_MIMETYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll() {
    return this.mediaService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
          cb(new BadRequestException('Only image uploads are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.create(file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
```

- [ ] **Step 7: Create `src/media/media.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
```

- [ ] **Step 8: Register `MediaModule` in `AppModule`**

Modify `work/aliaflow-cms/src/app.module.ts` — add the import and list it after `SectionsModule`:

```ts
import { MediaModule } from './media/media.module';
// ...
    SectionsModule,
    MediaModule,
```

- [ ] **Step 9: Commit**

```bash
cd work/aliaflow-cms
git add src/media src/app.module.ts
git commit -m "feat: add media module for image uploads"
```

---

### Task 6: Seed script, README, and manual verification

**Files:**
- Create: `work/aliaflow-cms/scripts/seed.ts`
- Create: `work/aliaflow-cms/README.md`

**Interfaces:**
- Consumes: `User` (Task 2), `Section` (Task 4), `Media` (Task 5) entities.
- Produces: a `npm run seed` command that creates the admin user (from `ADMIN_EMAIL`/`ADMIN_PASSWORD`) and the initial `Section` rows mirroring `aliaflow-nextjs`'s current hardcoded content (`hero`, `nav-links`, `footer`, `outcomes`, `service-cards`, `leadership-cards`, `design-cards`, `projects`, `trust`), idempotently (skips rows that already exist).

- [ ] **Step 1: Create `scripts/seed.ts`**

```ts
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../src/users/user.entity';
import { Section } from '../src/sections/section.entity';
import { Media } from '../src/media/media.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'aliaflow',
  password: process.env.DB_PASSWORD ?? 'aliaflow',
  database: process.env.DB_NAME ?? 'aliaflow_cms',
  entities: [User, Section, Media],
  synchronize: true,
});

const initialSections: Array<{ key: string; label: string; data: Record<string, unknown> }> = [
  {
    key: 'hero',
    label: 'Hero',
    data: {
      eyebrow: 'A L I A F L O W',
      heading: 'YOUR TRUSTED<br />LEADERSHIP PARTNER',
      image: '/assets/boardroom.png',
    },
  },
  {
    key: 'nav-links',
    label: 'Header navigation',
    data: { links: ['Home', 'Products', 'Packages', 'Projects', 'About us', 'Contact us'] },
  },
  {
    key: 'footer',
    label: 'Footer',
    data: {
      eyebrow: "LET'S TALK",
      heading: 'Make your business<br /><em>thrive.</em>',
      email: 'hello@aliaflow.com',
      wordmark: 'ALIAFLOW',
      tagline: 'Leadership partner for desirable, competitive and scalable businesses.',
      social: [
        { label: 'LinkedIn', href: '#home' },
        { label: 'Instagram', href: '#home' },
      ],
      copyright: '© 2025 Aliaflow. All rights reserved.',
    },
  },
  {
    key: 'outcomes',
    label: 'Outcome stack',
    data: {
      items: [
        {
          label: 'is Desirable',
          emphasis: 'DIFFERENT',
          copy: 'We create a truly differentiated business for you, built around the new and emerging needs and desires in your target market.',
          stats: ['# 4 Senses', '# 3 Loops'],
        },
        {
          label: 'is Feasible',
          emphasis: 'COMPETITIVE',
          copy: "The competitive advantage we create for you is based on a mixture of your organization's capabilities and the future of emerging technologies, which makes it a unique and hard-to-copy advantage. At the same time, this competitive advantage will be at several silos and levels of your organization. Different types of innovation would eventually make it hard for your competitors to imitate your business structure.",
          stats: ['# 7 Risks', '# 6 Roles', '# 5 Games'],
        },
        {
          label: 'is Viable',
          emphasis: 'SCALABLE',
          copy: 'At this stage, we design a sustainable revenue model for your business that ensures long-term growth and keeps the organization moving steadily toward its goals. This model is built to support consistent progress, not just short-term gains. We also plan growth in a controlled and strategic way at every phase, ensuring that each step strengthens the business and prepares it for the next version of your business model.',
          stats: ['# 8 Changes', '# 9 Tests'],
        },
      ],
    },
  },
  {
    key: 'service-cards',
    label: 'Service catalogue',
    data: {
      items: [
        { number: '1', title: 'Future of X Book', body: 'We turn complex futures into a clear, shared business narrative.', image: '/assets/magazine.png' },
        { number: '2', title: 'Critical Business Loop', body: 'We discover the loops that connect customer value, operations and growth.', image: '/assets/metro-paths.png' },
        { number: '3', title: 'Brand Culture & XP', body: 'We shape the customer and employee experiences that make strategy tangible.', image: '/assets/people-feedback.png' },
      ],
    },
  },
  {
    key: 'leadership-cards',
    label: 'Leadership cards',
    data: {
      items: [
        { number: '04', title: 'BUSINESS GAME', body: 'Strategic simulation sessions for decisions made under uncertainty.', image: '/assets/leadership-team.png' },
        { number: '05', title: 'STRATEGIC ROLES', body: 'A shared language for accountable, complementary leadership roles.', image: '/assets/metro-boardroom.png' },
        { number: '06', title: 'LEADERSHIP MODEL', body: 'Leadership operating models that turn strategic intent into action.', image: '/assets/speaking-halftone.png' },
      ],
    },
  },
  {
    key: 'design-cards',
    label: 'Design cards',
    data: {
      items: [
        { number: '07', title: 'RISK SETTING', body: 'Set the relevant boundaries before change becomes expensive.', image: '/assets/robotics-halftone.png' },
        { number: '08', title: 'CHANGE SOLVING', body: 'Move complex transformations from ambition to coordinated delivery.', image: '/assets/design-event.png' },
        { number: '09', title: 'PERFORMANCE TESTING', body: 'Test business capability in the reality of your operating system.', image: '/assets/workshop.png' },
      ],
    },
  },
  {
    key: 'projects',
    label: 'Projects',
    data: {
      items: [
        { name: 'Alialab', subtitle: 'Innovation & design lab', image: '/assets/alialab-loop.png' },
        { name: 'Aliapay', subtitle: 'Payment experience', image: '/assets/aliapay-loop.png' },
        { name: 'Aliasys', subtitle: 'Scalable operating system', image: '/assets/aliasys-loop.png' },
      ],
    },
  },
  {
    key: 'trust',
    label: 'Trust section',
    data: {
      eyebrow: 'WHY CHOOSE US?',
      heading: 'Enabling business thrivability through technocratic innovation',
      pillars: [
        { number: '01', title: 'DIFFERENT', body: 'We recognize the needs that are about to matter.' },
        { number: '02', title: 'COMPETITIVE', body: 'We translate strategic intent into operating advantage.' },
        { number: '03', title: 'SCALABLE', body: 'We design change to live beyond the launch.' },
      ],
      teamEyebrow: 'THE PEOPLE BEHIND ALIAFLOW',
      teamHeading: 'One team.<br />Many perspectives.',
      team: [
        { image: '/assets/ehteshamzadeh.png', name: 'S. Ehteshamzadeh', role: 'Strategic Design' },
        { image: '/assets/daem.png', name: 'V. Daem', role: 'Business Leadership' },
        { image: '/assets/mohit.png', name: 'N. Mohit', role: 'Experience Innovation' },
        { image: '/assets/tavakoli.png', name: 'N. Tavakoli', role: 'Transformation' },
      ],
    },
  },
];

async function seed() {
  await dataSource.initialize();

  const usersRepository = dataSource.getRepository(User);
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@aliaflow.com';
  const existingAdmin = await usersRepository.findOne({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'change-me-please', 10);
    await usersRepository.save(usersRepository.create({ email: adminEmail, passwordHash }));
    console.log(`Created admin user ${adminEmail}`);
  } else {
    console.log(`Admin user ${adminEmail} already exists`);
  }

  const sectionsRepository = dataSource.getRepository(Section);
  for (const section of initialSections) {
    const existing = await sectionsRepository.findOne({ where: { key: section.key } });
    if (existing) {
      console.log(`Section "${section.key}" already exists, skipping`);
      continue;
    }
    await sectionsRepository.save(sectionsRepository.create({ ...section, updatedBy: null }));
    console.log(`Seeded section "${section.key}"`);
  }

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run the seed script**

Run: `cd work/aliaflow-cms && npm run seed`
Expected: log lines `Created admin user admin@aliaflow.com` followed by nine `Seeded section "..."` lines.

- [ ] **Step 3: Create `README.md`**

```markdown
# Aliaflow CMS

NestJS content API for the Aliaflow landing site.

## Local development

1. `docker compose up -d` — starts Postgres on 5432.
2. `cp .env.example .env` and adjust `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`JWT_SECRET`.
3. `npm install`
4. `npm run seed` — creates the admin user and initial section content.
5. `npm run start:dev` — API on `http://localhost:4000/api`, Swagger docs on `http://localhost:4000/docs`.

## Manual verification

```bash
# Public read
curl http://localhost:4000/api/sections/hero

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@aliaflow.com","password":"change-me-please"}'
# => { "accessToken": "..." }

# Authenticated update (replace TOKEN)
curl -X PATCH http://localhost:4000/api/sections/hero \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN' \
  -d '{"data":{"eyebrow":"A L I A F L O W","heading":"NEW HEADLINE","image":"/assets/boardroom.png"}}'

# Upload an image (replace TOKEN and the file path)
curl -X POST http://localhost:4000/api/media \
  -H 'Authorization: Bearer TOKEN' \
  -F 'file=@/path/to/image.png'
```

## Tests

`npm test` — Jest unit tests for the users, auth, sections, and media services (mocked repositories, no live DB required).
```

- [ ] **Step 4: Run the full test suite**

Run: `cd work/aliaflow-cms && npm test`
Expected: PASS — all suites (`users`, `auth`, `sections`, `media`) green.

- [ ] **Step 5: Manually verify the running API**

With `docker compose up -d` and `npm run start:dev` running, execute the `curl` sequence from the README's "Manual verification" section. Confirm: the `GET /api/sections/hero` call returns the seeded hero data, login returns an `accessToken`, the `PATCH` call succeeds and returns the updated `data`, and a follow-up `GET /api/sections/hero` reflects the new heading. Confirm the media upload returns a `Media` record whose `url` (e.g. `/media/<uuid>.png`) is reachable at `http://localhost:4000/media/<uuid>.png`.

- [ ] **Step 6: Commit**

```bash
cd work/aliaflow-cms
git add scripts README.md
git commit -m "feat: add seed script and developer docs"
```

---

## After this plan

Two follow-up plans build on this API once it's verified working:

1. **Admin dashboard** (`work/aliaflow-admin`, Next.js + shadcn/ui) — login, section editor, media library, per the design spec's "Admin app" and "Auth flow" sections.
2. **Landing site cutover** (`work/aliaflow-nextjs`) — replace `data/site.ts` and hardcoded component copy with `fetch()` calls to `GET /api/sections`, with the current literals kept as a fallback, per the design spec's "Cutover" section.
