import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserCredentials } from './auth.model';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: UserCredentials, done: (err: Error | null, user: any) => void): any {
    done(null, user);
  }

  deserializeUser(payload: UserCredentials, done: (err: Error | null, payload: any) => void): any {
    done(null, payload);
  }
}
