import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Member } from '@models/member';
import { MemberService } from '@services/member.service';
import { SortingService } from '@services/sorting.service';
import { LoadingService } from '@shared/loading/loading.service';
import { map, Observable, tap } from 'rxjs';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent implements OnInit {
  members$: Observable<Member[]>;
  filteredMembers$: Observable<Member[]>;
  activeOnly: boolean = true;
  nameFilter: string = '';
  sortField: string = 'lastName';
  sortAsc: boolean = true;
  columnsToDisplay = ['firstName', 'lastName', 'activeText', 'totalAttendance'];

  constructor(
    private memberService: MemberService,
    private loadingService: LoadingService,
    private sorter: SortingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadingService.loadingOn();
    this.members$ = this.memberService.getMembersWithAttendances();
    this.filterMembers();
  }

  filterMembers(): void {
    this.filteredMembers$ = this.members$.pipe(
      map((members) => {
        return this.sorter.sort(
          members.filter(
            (member) =>
              (member.active || member.active == this.activeOnly) &&
              (member.firstName
                .toLowerCase()
                .includes(this.nameFilter.toLowerCase()) ||
                member.lastName
                  .toLowerCase()
                  .includes(this.nameFilter.toLowerCase()))
          ),
          this.sortField,
          this.sortAsc
        );
      }),
      tap(() => this.loadingService.loadingOff())
    );
  }

  sortMembers(e: { active: string; direction: string }): void {
    this.sortField = e.active;
    this.sortAsc = e.direction == 'asc';
    this.filterMembers();
  }

  clearSearch(): void {
    this.nameFilter = '';
    this.filterMembers();
  }

  onRowClick(member: Member) {
    this.router.navigate(['members', member.id]);
  }
}
