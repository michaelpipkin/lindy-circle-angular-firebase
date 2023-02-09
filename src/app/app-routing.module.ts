import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AddMemberComponent } from './members/add-member/add-member.component';
import { MemberDetailsComponent } from './members/member-details/member-details.component';
import { MembersComponent } from './members/members/members.component';
import { PracticesComponent } from './practices/practices/practices.component';
import {
  canActivate,
  hasCustomClaim,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/compat/auth-guard';

const redirectToLogin = () => redirectUnauthorizedTo(['login']);
const loggedIn = () => redirectLoggedInTo(['members']);
const adminOnly = () => hasCustomClaim('admin');

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/members' },
  {
    path: 'members',
    component: MembersComponent,
    ...canActivate(redirectToLogin),
  },
  {
    path: 'members/:id',
    component: MemberDetailsComponent,
    ...canActivate(adminOnly),
  },
  {
    path: 'practices',
    component: PracticesComponent,
    ...canActivate(redirectToLogin),
  },
  {
    path: 'login',
    component: LoginComponent,
    ...canActivate(loggedIn),
  },
  { path: '**', redirectTo: '/members' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
