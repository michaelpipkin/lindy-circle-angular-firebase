import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultsResolver } from '@services/defaults.resolver';
import { AdminMainComponent } from './admin/main/admin-main.component';
import { LoginComponent } from './auth/login/login.component';
import { ProfileComponent } from './auth/profile/profile.component';
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
    path: 'login',
    component: LoginComponent,
    ...canActivate(loggedInGuard),
  },
  {
    path: 'profile',
    component: ProfileComponent,
    ...canActivate(authGuard),
  },
  {
    path: 'members',
    component: MembersComponent,
  },
  {
    path: 'members/:id',
    component: MemberDetailsComponent,
    ...canActivate(adminGuard),
  },
  {
    path: 'practices',
    component: PracticesComponent,
  },
  {
    path: 'practices/:id',
    component: PracticeDetailsComponent,
    ...canActivate(adminGuard),
  },
  {
    path: 'settings',
    component: AdminMainComponent,
    ...canActivate(adminGuard),
    resolve: {
      defaultValues$: DefaultsResolver,
    },
  },
  { path: '**', redirectTo: '/members' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
