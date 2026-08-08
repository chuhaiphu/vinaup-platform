import type { EmbeddedUserResponse } from 'src/user/dtos/user.response.dto';

// Assembled server-side rather than queried as one row, so it is hand-written.
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: EmbeddedUserResponse;
}
