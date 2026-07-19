import type { z } from 'zod';

import { bookingFilterSchema, createBookingSchema, updateBookingSchema } from '../zod-schemas/booking.schema';

export type CreateBookingRequestInterface = z.infer<typeof createBookingSchema>;
export type UpdateBookingRequestInterface = z.infer<typeof updateBookingSchema>;
export type BookingFilterRequestInterface = z.infer<typeof bookingFilterSchema>;
