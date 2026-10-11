import { UserResponseModel } from './user.model';

export interface AuthResponseModel {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponseModel;
}
