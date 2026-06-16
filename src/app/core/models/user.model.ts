export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  isSubscribed: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
  countryCode?: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
