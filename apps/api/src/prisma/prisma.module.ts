import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaService } from './prisma.service';
import databaseConfig from '../_core/configs/database.config';

@Module({
  imports: [
    // ─── ConfigModule.forFeature(databaseConfig): expose config locally ─
    // forFeature = register a config namespace for THIS module only, 
    // so its token (databaseConfig.KEY) becomes injectable in the factory below.
    // It does NOT read .env — that is forRoot's job (app.module.ts), which must have run first.
    ConfigModule.forFeature(databaseConfig),
  ],
  providers: [PrismaService,
    {
      // ─── Factory provider: build the Postgres adapter at runtime ────────
      //
      //   • provide    = the token (a lookup key) others will inject. 
      //                  PrismaService injects this exact key ('DATABASE').
      //   • useFactory = the function that builds the value. 
      //                  NestJS calls it and registers whatever it RETURNS (the adapter) under the token.
      //   • inject     = config tokens NestJS resolves and passes INTO useFactory,
      //                  in the SAME order as its parameters.
      //
      // WHY a factory (not a class): the adapter needs the runtime connection string, 
      // unknown at import time — it comes from the injected config.
      provide: 'DATABASE',
      useFactory: (databaseConf: ConfigType<typeof databaseConfig>) => {
        // PrismaPg = the Prisma 7 driver adapter; 
        // connects to Postgres directly through the `pg` library.
        const adapter = new PrismaPg({
          connectionString: databaseConf.url,
        });
        return adapter;
      },
      // databaseConfig.KEY resolves to the { url } config → passed as databaseConf.
      inject: [databaseConfig.KEY]
    },
  ],
  // exports to public that other modules can import. 
  // Only PrismaService is shared; the 'DATABASE' adapter stays internal. 
  // A module that imports PrismaModule can then inject PrismaService (but not the adapter).
  exports: [PrismaService],
})
export class PrismaModule { }