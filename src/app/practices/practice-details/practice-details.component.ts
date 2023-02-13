import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Attendance } from '@models/attendance';
import { DialogOptions } from '@models/dialog-options';
import { Practice } from '@models/practice';
import { PracticeService } from '@services/practice.service';
import { GenericDialogComponent } from '@shared/generic-dialog/generic-dialog.component';
import { LoadingService } from '@shared/loading/loading.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { EditPracticeComponent } from '../edit-practice/edit-practice.component';

@Component({
  selector: 'app-practice-details',
  templateUrl: './practice-details.component.html',
  styleUrls: ['./practice-details.component.scss'],
})
export class PracticeDetailsComponent implements OnInit {
  practiceId: string;
  practice$: Observable<Practice>;
  attendances$: Observable<Attendance[]>;
  practiceLoaded: boolean = false;
  attendeesLoaded: boolean = false;
  attendeeColumnsToDisplay = ['memberName', 'paymentTypeText', 'paymentAmount'];

  constructor(
    private practiceService: PracticeService,
    //private attendanceService: AttendanceService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private loading: LoadingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loading.loadingOn();
    this.practiceId = this.route.snapshot.paramMap.get('id');
    this.practice$ = this.practiceService
      .getPracticeDetails(this.practiceId)
      .pipe(
        tap((practice) => {
          if (practice == null) {
            this.router.navigateByUrl('/practices');
          }
          this.practiceLoaded = true;
          this.attendeesLoaded = true;
          this.turnLoaderOff();
        })
      );
  }

  turnLoaderOff(): void {
    if (this.practiceLoaded && this.attendeesLoaded) {
      this.loading.loadingOff();
    }
  }

  editPractice(practice: Practice): void {
    const dialogConfig: MatDialogConfig = {};
    dialogConfig.data = practice;
    this.dialog.open(EditPracticeComponent, dialogConfig);
  }

  deletePractice(practice: Practice): void {
    const dialogConfig: MatDialogConfig = {};
    dialogConfig.data = new DialogOptions({
      title: 'WARNING!',
      content: `This action cannot be undone. Are you sure you want to delete practice #${practice.practiceNumber}?`,
      trueButtonColor: 'warn',
      trueButtonText: 'Delete',
    });

    this.dialog
      .open(GenericDialogComponent, dialogConfig)
      .afterClosed()
      .subscribe((confirm) => {
        if (confirm) {
          this.loading.loadingOn();
          this.practiceService
            .deletePractice(practice.id)
            .pipe(
              tap(() => {
                this.loading.loadingOff();
                this.router.navigateByUrl('/practices');
              }),
              catchError((err: Error) => {
                this.snackBar.open(
                  'Something went wrong - could not delete practice.',
                  'Close',
                  {
                    verticalPosition: 'top',
                  }
                );
                this.loading.loadingOff();
                return throwError(() => new Error(err.message));
              })
            )
            .subscribe();
        }
      });
  }

  onRowClick(attendance: Attendance) {
    this.router.navigate(['members', attendance.memberId]);
  }
}
