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

  constructor(private auth: AngularFireAuth, private router: Router) {
    this.isLoggedIn$ = auth.authState.pipe(map((user) => !!user));
    this.roles$ = auth.idTokenResult.pipe(
      map((token) => <any>token?.claims ?? { admin: false })
    );
  }

  logout() {
    this.auth.signOut().finally(() => this.router.navigateByUrl('/login'));
  }
}
