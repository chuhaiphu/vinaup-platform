# Technical Stack Specification - VinaUp Platform

This document serves as the master index of references for the selected technology stack of **VinaUp Platform**.

---

## 1. Project Orchestration & Code Quality

*   **npm Workspaces**: [docs.npmjs.com/cli/v10/using-npm/workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
*   **ESLint**: [eslint.org](https://eslint.org)

---

## 2. Mobile App Client

*   **Expo**: [expo.dev](https://expo.dev)
*   **Expo Router**: [docs.expo.dev/router/introduction](https://docs.expo.dev/router/introduction/)
*   **React Native StyleSheet**: [reactnative.dev/docs/stylesheet](https://reactnative.dev/docs/stylesheet)
*   **Zustand**: [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)
*   **fetchwire**: [npmjs.com/package/fetchwire](https://www.npmjs.com/package/fetchwire) — HTTP client for the repository layer (`wireApi`)

---

## 3. Backend Service

*   **Nest.js**: [nestjs.com](https://nestjs.com)

---

## 4. Database & Data Access

*   **PostgreSQL**: [postgresql.org](https://www.postgresql.org)
*   **Prisma ORM**: [prisma.io](https://www.prisma.io)

---

## 5. Security & Session

*   **Custom JWT (access token)**: [jwt.io](https://jwt.io) — short-lived access JWT verified statelessly per request; delivered via the `atk` httpOnly cookie (see [apps/api AUTH-FLOW](../apps/api/docs/architecture/AUTH-FLOW.md)).
*   **bcrypt**: [github.com/kelektiv/node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)

---

## 6. Deployment & CI/CD Lifecycle

*   **Self-hosted Docker**: API + PostgreSQL run as a Docker Compose stack co-located with `apps/api`, behind an external reverse-proxy network.

---

## 7. Unified Validation

*   **Zod**: [zod.dev](https://zod.dev) — single source of truth for request shapes; schemas in `packages/validation`, types inferred via `z.infer`, reused by api and mobile.
*   **nestjs-zod**: [github.com/BenLorantfy/nestjs-zod](https://github.com/BenLorantfy/nestjs-zod) — API enforcement: global `ZodValidationPipe` + `createZodDto` bridge.
