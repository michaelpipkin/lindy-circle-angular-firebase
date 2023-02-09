import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Practice } from '@models/practice';
import { PracticeService } from '@services/practice.service';
import { SortingService } from '@services/sorting.service';
import { UserService } from '@services/user.service';
import { LoadingService } from '@shared/loading/loading.service';
import { Timestamp } from 'firebase/firestore';
import { map, Observable, tap } from 'rxjs';

@Component({
  selector: 'app-practices',
  templateUrl: './practices.component.html',
  styleUrls: ['./practices.component.scss'],
})
export class PracticesComponent implements OnInit {
  practices$: Observable<Practice[]>;
  filteredPractices$: Observable<Practice[]>;
  tableTooltip: string = '';
  startDate: Timestamp;
  endDate: Timestamp;
  sortField: string = 'practiceNumber';
  sortAsc: boolean = false;
  columnsToDisplay: string[] = [
    'practiceNumber',
    'practiceDate',
    'practiceTopic',
    'attendanceCount',
  ];

  constructor(
    private practiceService: PracticeService,
    private loadingService: LoadingService,
    public user: UserService,
    private sorter: SortingService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadingService.loadingOn();
    this.practices$ = this.practiceService.getPractices();
    this.filterPractices();
  }

  filterPractices(): void {
    this.filteredPractices$ = this.practices$.pipe(
      map((practices: Practice[]) => {
        const filteredPractices: Practice[] = this.sorter.sort(
          practices.filter(
            (practice: Practice) =>
              practice.practiceDate >= (this.startDate ?? 0) &&
              practice.practiceDate <= (this.endDate ?? new Date())
          ),
          this.sortField,
          this.sortAsc
        );
        this.tableTooltip = `${filteredPractices.length} practices`;
        return filteredPractices;
      }),
      tap(() => this.loadingService.loadingOff())
    );
  }

  sortPractices(e: { active: string; direction: string }): void {
    this.sortField = e.active;
    this.sortAsc = e.direction == 'asc';
    this.filterPractices();
  }

  onRowClick(practice: Practice) {
    this.user.roles$
      .pipe(
        tap((roles) => {
          if (roles.admin) {
            this.router.navigate(['practices', practice.id]);
          }
        })
      )
      .subscribe();
  }

  addPractice(): void {
    //this.dialog.open(AddPracticeComponent);
  }
}
