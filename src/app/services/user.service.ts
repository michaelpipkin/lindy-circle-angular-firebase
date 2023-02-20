import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { UserRoles } from './user-roles';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isLoggedIn$: Observable<boolean>;
  roles$: Observable<UserRoles>;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.isLoggedIn$ = afAuth.authState.pipe(map((user) => !!user));
    this.roles$ = afAuth.idTokenResult.pipe(
      map((token) => <any>token?.claims ?? { admin: false })
    );
  }

  logout() {
    this.afAuth.signOut().finally(() => this.router.navigateByUrl('/login'));
  }
}
