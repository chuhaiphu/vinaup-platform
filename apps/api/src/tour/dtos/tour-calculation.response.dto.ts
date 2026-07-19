import { BaseMeta } from 'src/_common/interfaces/interface';
import { Tour, User } from 'src/prisma/generated/client';

export type TourCalculationMeta = BaseMeta

export class TourCalculationResponse {
  id!: string;
  adultTicketCount!: number;
  childTicketCount!: number;
  adultTicketPrice!: number;
  childTicketPrice!: number;
  taxRate!: number;
  createdBy!: User | null;
  tour!: Tour;
}

export type TourCalculationWithMeta = TourCalculationResponse & {
  meta: TourCalculationMeta;
};
