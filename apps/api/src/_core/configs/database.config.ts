import { registerAs } from "@nestjs/config";

export interface DatabaseConfig {
  url: string;
}

// ─── Namespaced config "database"
// registerAs(name, factory) function will: 
// 1. Groups config under a name ("database")
// 2. Returns it in a form NestJS can inject. Two terms it introduces:
//
//   • factory = the arrow function below. We never call it, NestJS calls it.
//               and whatever it RETURNS becomes the config object (this case is { url }).
//   • token   = a lookup key NestJS generates for that returned object,
//               (this case exposed as `databaseConfig.KEY`). 
//               Code asks this key to get the config back.
//
// How `url` is actually obtained:
//   1. ConfigModule.forRoot() reads the .env file into process.env  → app.module.ts
//   2. someone injects databaseConfig.KEY  → NestJS runs the factory below
//   3. the factory reads process.env.DATABASE_URL and returns { url }
// Skip step 1 and process.env.DATABASE_URL is undefined → url is undefined.
//
// WHY do this instead of reading process.env.DATABASE_URL directly: one typed source of truth
export default registerAs('database', (): DatabaseConfig => {
  return {
    url: process.env.DATABASE_URL!,
  };
});