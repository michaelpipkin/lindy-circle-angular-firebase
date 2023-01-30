import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMemberComponent } from './members/add-member/add-member.component';
import { MemberDetailsComponent } from './members/member-details/member-details.component';
import { MembersComponent } from './members/members/members.component';

const routes: Routes = [
  { path: 'members', component: MembersComponent },
  { path: 'add-member', component: AddMemberComponent },
  { path: 'member-details/:id', component: MemberDetailsComponent },
  { path: '**', component: MembersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
