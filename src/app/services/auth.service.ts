import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: AngularFireAuth) { }

  signUp(email: string, password: string): any {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  signIn(email: string, password: string): any {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  getUser(): any {
    return this.auth.authState;
  }

  signOut(): any {
    return this.auth.signOut();
  }

  signInMobile(phone, password): any {
    return this.auth.signInWithPhoneNumber(phone, password);
  }

}
