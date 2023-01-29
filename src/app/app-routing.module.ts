import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddMemberComponent } from './members/add-member/add-member.component';
import { MembersComponent } from './members/members/members.component';

const routes: Routes = [
  { path: 'members', component: MembersComponent },
  { path: 'add-member', component: AddMemberComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
