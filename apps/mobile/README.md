<div align="center">
  <img src="src/assets/images/vinaup_logo_primary.png" alt="VinaUp Logo" width="120" />
  <h1>VinaUp Mobile</h1>
  <p>Income & expense management app for individuals and organizations.</p>

  ![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
  ![Expo](https://img.shields.io/badge/Expo-57.0.0-000020?logo=expo)
  ![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
  ![React Native](https://img.shields.io/badge/React%20Native-0.86.0-61DAFB?logo=react)

  [![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=chuhaiphu_vinaup-mobile-app&token=881c30af388965353947bf57ce0cf625fc792abd)](https://sonarcloud.io/summary/new_code?id=chuhaiphu_vinaup-mobile-app)

  [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=chuhaiphu_vinaup-mobile-app&metric=bugs&token=881c30af388965353947bf57ce0cf625fc792abd)](https://sonarcloud.io/summary/new_code?id=chuhaiphu_vinaup-mobile-app)
  [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=chuhaiphu_vinaup-mobile-app&metric=reliability_rating&token=881c30af388965353947bf57ce0cf625fc792abd)](https://sonarcloud.io/summary/new_code?id=chuhaiphu_vinaup-mobile-app)
  [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=chuhaiphu_vinaup-mobile-app&metric=security_rating&token=881c30af388965353947bf57ce0cf625fc792abd)](https://sonarcloud.io/summary/new_code?id=chuhaiphu_vinaup-mobile-app)
  [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=chuhaiphu_vinaup-mobile-app&metric=sqale_rating&token=881c30af388965353947bf57ce0cf625fc792abd)](https://sonarcloud.io/summary/new_code?id=chuhaiphu_vinaup-mobile-app)
  [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=chuhaiphu_vinaup-mobile-app&metric=vulnerabilities&token=881c30af388965353947bf57ce0cf625fc792abd)](https://sonarcloud.io/summary/new_code?id=chuhaiphu_vinaup-mobile-app)
</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Patterns](#patterns)
- [Principles](#principles)
- [Conventions](#conventions)
- [Setup](#setup)

---

## Overview

VinaUp Mobile is an income and expense management app for a wide range of users — from individuals such as office workers and laborers, to organizations including small retail businesses.

The app currently includes specialized support for **Travel Companies and Tour Guides**, with plans to expand to additional business types in the future.

The app operates in two modes:

- **Personal Mode** — income/expense tracking and project management for individual users
- **Organization Mode** — full workspace per organization with tours, bookings, invoices, projects, and team management

A single account can belong to multiple organizations and switch between them seamlessly.

---

## Architecture

For system context, component structure, and how the app is organized internally, see:

**[docs/diagram/SYSTEM-CONTEXT-DIAGRAM.md](docs/diagram/SYSTEM-CONTEXT-DIAGRAM.md)**

**[docs/diagram/COMPONENT-DIAGRAM.md](docs/diagram/COMPONENT-DIAGRAM.md)**

**[docs/diagram/SCREEN-FLOW-DIAGRAM.md](docs/diagram/SCREEN-FLOW-DIAGRAM.md)**

---

## Patterns

Design patterns used consistently throughout the codebase.

**[docs/pattern/REPOSITORY-PATTERN.md](docs/pattern/REPOSITORY-PATTERN.md)**

**[docs/pattern/PROVIDER-PATTERN.md](docs/pattern/PROVIDER-PATTERN.md)**

**[docs/pattern/OBSERVER-PATTERN.md](docs/pattern/OBSERVER-PATTERN.md)**

**[docs/pattern/COMPOSITE-PATTERN.md](docs/pattern/COMPOSITE-PATTERN.md)**

**[docs/pattern/INSTANT-TIME-PATTERN.md](docs/pattern/INSTANT-TIME-PATTERN.md)**

**[docs/pattern/CALENDAR-DATE-PATTERN.md](docs/pattern/CALENDAR-DATE-PATTERN.md)**

---

## Principles

Engineering principles that guide decisions across the codebase.

**[docs/principle/SOC.md](docs/principle/SOC.md)**

**[docs/principle/DRY.md](docs/principle/DRY.md)**

**[docs/principle/KISS.md](docs/principle/KISS.md)**

---

## Conventions

The canonical, tooling-enforced source of truth for naming, structure, and style.

**[docs/CODING-CONVENTION.md](docs/CODING-CONVENTION.md)**

---

## Setup

For installation, environment variables, local development build, USB debugging, wireless debugging, and EAS build instructions, see:

**[docs/setup/SETUP.md](docs/setup/SETUP.md)**

If you cannot connect wirelessly during development, see:

**[docs/setup/TROUBLESHOOTING.md](docs/setup/TROUBLESHOOTING.md)**
