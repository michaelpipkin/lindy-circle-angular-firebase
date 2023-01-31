import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogOptions } from '@models/dialog-options';
import { Member } from '@models/member';
import { Practice } from '@models/practice';
import { MemberService } from '@services/member.service';
import { PracticeService } from '@services/practice.service';
import { GenericDialogComponent } from '@shared/generic-dialog/generic-dialog.component';
import { LoadingService } from '@shared/loading/loading.service';
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
    private memberService: MemberService,
    private practiceService: PracticeService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadingService.loadingOn();
    this.memberId = this.route.snapshot.paramMap.get('id');
    this.member$ = this.memberService.getMemberDetails(this.memberId).pipe(
      tap((member) => {
        if (member == null) {
          this.router.navigateByUrl('/members');
        }
      })
    );
    this.practices$ = this.practiceService
      .getPracticesForMember(this.memberId)
      .pipe(tap(() => this.loadingService.loadingOff()));
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
          this.memberService
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
