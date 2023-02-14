import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MemberDetailsComponent } from './members/member-details/member-details.component';
import { MembersComponent } from './members/members/members.component';
import { PracticeDetailsComponent } from './practices/practice-details/practice-details.component';
import { PracticesComponent } from './practices/practices/practices.component';
import {
  canActivate,
  hasCustomClaim,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/compat/auth-guard';

const authGuard = () => redirectUnauthorizedTo(['login']);
const loggedInGuard = () => redirectLoggedInTo(['members']);
const adminGuard = () => hasCustomClaim('admin');

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/members' },
  {
    path: 'members',
    component: MembersComponent,
    ...canActivate(authGuard),
  },
  {
    path: 'members/:id',
    component: MemberDetailsComponent,
    ...canActivate(adminGuard),
  },
  {
    path: 'practices',
    component: PracticesComponent,
    ...canActivate(authGuard),
  },
  {
    path: 'practices/:id',
    component: PracticeDetailsComponent,
    ...canActivate(adminGuard),
  },
  {
    path: 'login',
    component: LoginComponent,
    ...canActivate(loggedInGuard),
  },
  { path: '**', redirectTo: '/members' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
