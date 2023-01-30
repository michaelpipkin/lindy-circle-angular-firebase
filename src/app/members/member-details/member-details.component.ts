import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { throwToolbarMixedModesError } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogOptions } from '@models/dialog-options';
import { Member } from '@models/member';
import { Practice } from '@models/practice';
import { MembersService } from '@services/members.service';
import { PracticesService } from '@services/practices.service';
import { GenericDialogComponent } from '@shared/generic-dialog/generic-dialog.component';
import { catchError, Observable, pipe, tap, throwError } from 'rxjs';
import { EditMemberComponent } from '../edit-member/edit-member.component';

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.scss'],
})
export class MemberDetailsComponent implements OnInit {
  memberId: string;
  member$: Observable<Member>;
  practices$: Observable<Practice[]>;
  practiceColumnsToDisplay = [
    'practiceNumber',
    'practiceDate',
    'practiceTopic',
  ];

  constructor(
    private membersService: MembersService,
    private practicesService: PracticesService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.params['id'];
    this.member$ = this.membersService.getMemberDetails(this.memberId);
    this.practices$ = this.practicesService.getPracticesForMember(
      this.memberId
    );
  }

  editMember(member: Member) {
    const dialogConfig: MatDialogConfig = {};

    dialogConfig.data = member;

    this.dialog.open(EditMemberComponent, dialogConfig);
  }

  deleteMember(member: Member) {
    const dialogConfig: MatDialogConfig = {};

    dialogConfig.data = new DialogOptions({
      title: 'WARNING!',
      content: `This action cannot be undone. Are you sure you want to delete ${member.firstLastName}?`,
      trueButtonColor: 'warn',
      trueButtonText: 'Delete',
    });

    this.dialog
      .open(GenericDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.membersService
            .deleteMember(member.id)
            .pipe(
              tap(() => {
                this.router.navigate(['members']);
              }),
              catchError((err: Error) => {
                alert('Could not delete member.');
                return throwError(() => new Error(err.message));
              })
            )
            .subscribe();
        }
      });
  }
}
