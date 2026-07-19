import { Car } from 'src/prisma/generated/client';

export class CarMaintenanceLogResponse {
  id!: string;
  carId!: string;
  car?: Car;
}
