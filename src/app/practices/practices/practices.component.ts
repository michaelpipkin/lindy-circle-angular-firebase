import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Practice } from '@models/practice';
import { PracticeService } from '@services/practice.service';
import { SortingService } from '@services/sorting.service';
import { UserService } from '@services/user.service';
import { LoadingService } from '@shared/loading/loading.service';
import { map, Observable, tap } from 'rxjs';
import { AddPracticeComponent } from '../add-practice/add-practice.component';

@Component({
  selector: 'app-practices',
  templateUrl: './practices.component.html',
  styleUrls: ['./practices.component.scss'],
})
export class PracticesComponent implements OnInit {
  practices$: Observable<Practice[]>;
  filteredPractices$: Observable<Practice[]>;
  tableTooltip: string = '';
  startDate: Date | null;
  endDate: Date | null;
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
    public user: UserService,
    private sorter: SortingService,
    private router: Router,
    private dialog: MatDialog,
    private loading: LoadingService
  ) {}

  ngOnInit(): void {
    this.loading.loadingOn();
    this.practices$ = this.practiceService
      .getPractices()
      .pipe(tap(() => this.loading.loadingOff()));
    this.filterPractices();
  }

  filterPractices(): void {
    this.filteredPractices$ = this.practices$.pipe(
      map((practices: Practice[]) => {
        let filteredPractices: Practice[] = practices.filter(
          (practice: Practice) =>
            practice.practiceDate.toDate() >= (this.startDate ?? 0) &&
            practice.practiceDate.toDate() <= (this.endDate ?? new Date())
        );
        if (filteredPractices.length > 0) {
          filteredPractices = this.sorter.sort(
            filteredPractices,
            this.sortField,
            this.sortAsc
          );
        }
        this.tableTooltip = `${filteredPractices.length} practices`;
        return filteredPractices;
      })
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

  clearStartDate(): void {
    this.startDate = null;
    this.filterPractices();
  }

  clearEndDate(): void {
    this.endDate = null;
    this.filterPractices();
  }

  addPractice(): void {
    this.dialog.open(AddPracticeComponent, {
      width: '500px',
    });
  }
}
