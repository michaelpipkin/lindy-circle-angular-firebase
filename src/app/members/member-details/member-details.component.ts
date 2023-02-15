import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { AddPunchCardComponent } from 'src/app/punch-cards/add-punch-card/add-punch-card.component';
import { TransferPunchCardComponent } from 'src/app/punch-cards/transfer-punch-card/transfer-punch-card.component';
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
    'purchaseMemberName',
    'purchaseAmount',
    'punchesRemaining',
  ];

  constructor(
    private memberService: MemberService,
    private practiceService: PracticeService,
    private punchCardService: PunchCardService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private loading: LoadingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loading.loadingOn();
    this.memberId = this.route.snapshot.paramMap.get('id');
    this.member$ = this.memberService.getMemberDetails(this.memberId).pipe(
      tap((member) => {
        if (member == null) {
          this.router.navigateByUrl('/members');
        }
        this.memberLoaded = true;
        this.turnLoaderOff();
      })
    );
    this.practices$ = this.practiceService
      .getPracticesForMember(this.memberId)
      .pipe(
        tap(() => {
          this.practicesLoaded = true;
          this.turnLoaderOff();
        })
      );
    this.punchCards$ = this.punchCardService
      .getPunchCardsForMember(this.memberId)
      .pipe(
        tap(() => {
          this.punchCardsLoaded = true;
          this.turnLoaderOff();
        })
      );
    this.punchCardService
      .getUsablePunchCardForMember(this.memberId)
      .pipe(
        tap((punchCard: PunchCard) => {
          console.log(punchCard);
        })
      )
      .subscribe();
  }

  turnLoaderOff(): void {
    if (this.memberLoaded && this.practicesLoaded && this.punchCardsLoaded) {
      this.loading.loadingOff();
    }
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
          this.memberService
            .deleteMember(member.id)
            .pipe(
              tap(() => this.router.navigateByUrl('/members')),
              catchError((err: Error) => {
                this.snackBar.open(
                  'Something went wrong - could not delete member.',
                  'Close',
                  {
                    verticalPosition: 'top',
                  }
                );
                return throwError(() => new Error(err.message));
              })
            )
            .subscribe();
        }
      });
  }

  addPunchCard(member: Member): void {
    const dialogConfig: MatDialogConfig = {};
    dialogConfig.data = member;
    this.dialog.open(AddPunchCardComponent, dialogConfig);
  }

  deletePunchCard(member: Member, punchCard: PunchCard): void {
    this.punchCardService
      .deletePunchCard(member, punchCard)
      .pipe(
        tap(() =>
          this.snackBar.open('Punch card deleted.', 'OK', {
            verticalPosition: 'top',
            duration: 5000,
          })
        ),
        catchError((err: Error) => {
          this.snackBar.open(
            'Something went wrong - could not delete punch card.',
            'Close',
            {
              verticalPosition: 'top',
            }
          );
          return throwError(() => new Error(err.message));
        })
      )
      .subscribe();
  }

  transferPunchCard(currentMember: Member, punchCard: PunchCard): void {
    this.dialog.open(TransferPunchCardComponent, {
      data: {
        currentMember: currentMember,
        punchCard: punchCard,
      },
    });
  }

  onPracticeRowClick(practice: Practice) {
    this.router.navigate(['practices', practice.id]);
  }
}
