import { IUser } from '../../models/admitted.model'

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
