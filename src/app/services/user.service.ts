import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase/auth';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { UserRoles } from './user-roles';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<firebase.User>(null);
  currentUser$: Observable<firebase.User> = this.userSubject.asObservable();
  isLoggedIn$: Observable<boolean>;
  roles$: Observable<UserRoles>;

  constructor(private auth: AngularFireAuth, private router: Router) {
    this.isLoggedIn$ = auth.authState.pipe(map((user) => !!user));
    this.roles$ = auth.idTokenResult.pipe(
      map((token) => <any>token?.claims ?? { admin: false })
    );
  }

  init() {
    this.auth.authState
      .pipe(
        map((user: firebase.User) => {
          this.userSubject.next(user);
        })
      )
      .subscribe();
  }

  logout() {
    this.auth.signOut().finally(() => this.router.navigateByUrl('/login'));
  }

  getCurrentUser(): firebase.User {
    return this.userSubject.getValue();
  }
}
