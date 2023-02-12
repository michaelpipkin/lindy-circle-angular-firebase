import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogOptions } from '@models/dialog-options';
import { Member } from '@models/member';
import { Practice } from '@models/practice';
import { PunchCard } from '@models/punch-card';
import { MemberService } from '@services/member.service';
import { PracticeService } from '@services/practice.service';
import { PunchCardService } from '@services/punch-card.service';
import { GenericDialogComponent } from '@shared/generic-dialog/generic-dialog.component';
import { LoadingService } from '@shared/loading/loading.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
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
  punchCards$: Observable<PunchCard[]>;
  memberLoaded: boolean = false;
  practicesLoaded: boolean = false;
  punchCardsLoaded: boolean = false;
  practiceColumnsToDisplay = [
    'practiceNumber',
    'practiceDate',
    'practiceTopic',
  ];
  punchCardColumnsToDisplay = [
    'purchaseDate',
    'purchaseAmount',
    'punchesRemaining',
  ];

  constructor(
    private memberService: MemberService,
    private practiceService: PracticeService,
    private punchCardService: PunchCardService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.paramMap.get('id');
    this.member$ = this.memberService.getMemberDetails(this.memberId).pipe(
      tap((member) => {
        if (member == null) {
          this.router.navigateByUrl('/members');
        }
        this.memberLoaded = true;
      })
    );
    this.practices$ = this.practiceService
      .getPracticesForMember(this.memberId)
      .pipe(
        tap(() => {
          this.practicesLoaded = true;
        })
      );
    this.punchCards$ = this.punchCardService
      .getPunchCardsForMember(this.memberId)
      .pipe(
        tap(() => {
          this.punchCardsLoaded = true;
        })
      );
  }

  editMember(member: Member): void {
    const dialogConfig: MatDialogConfig = {};
    dialogConfig.data = member;
    this.dialog.open(EditMemberComponent, dialogConfig);
  }

  deleteMember(member: Member): void {
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
          this.memberService.deleteMember(member.id).subscribe();
        }
      });
  }

  onPracticeRowClick(practice: Practice) {}

  onPunchCardRowClick(punchCard: PunchCard) {}
}
