import { Inject, Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/client';

// ─── PrismaService: the single injectable entry-point for all DB access
//
//   1. @Injectable() = lets NestJS's DI container build and manage this class as a SINGLETON,
//      one shared instance for the whole app = one DB connection pool.
//      Other code imports PrismaModule and injects this.
//   2. extends PrismaClient = inherits every generated query method from PrismaClient
//      (this case: this.user.findMany(), this.car.create(), ...).
//   3. super({ adapter }) = hands Prisma the connection to use (constructor).
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(
    // @Inject('DATABASE') = ask the DI container for the provider registered
    // under the 'DATABASE' token — the PrismaPg adapter PrismaModule built.
    @Inject('DATABASE')
    databaseAdapter: InstanceType<typeof PrismaPg>,
  ) {
    // "driver adapter" = the object that actually talks to Postgres.
    // super(...) calls the PARENT constructor (PrismaClient) with the adapter.
    super({ adapter: databaseAdapter });
  }
}
