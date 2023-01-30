import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Member } from '@models/member';
import { MembersService } from '@services/members.service';
import { Observable } from 'rxjs';
import { EditMemberComponent } from '../edit-member/edit-member.component';

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.scss'],
})
export class MemberDetailsComponent implements OnInit {
  memberId: string;
  member$: Observable<Member>;

  constructor(
    private membersService: MembersService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.params['id'];
    this.member$ = this.membersService.getMemberDetails(this.memberId);
  }

  editMember(member: Member) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '280px';

    dialogConfig.data = member;

    this.dialog.open(EditMemberComponent, dialogConfig);
  }

  deleteMember(member: Member) {}
}
