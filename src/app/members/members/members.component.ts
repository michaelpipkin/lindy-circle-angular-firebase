import { Component, OnInit } from '@angular/core';
import { Member } from '@models/member';
import { MembersService } from '@services/members.service';
import { SortingService } from '@services/sorting.service';
import { map, Observable } from 'rxjs';

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
    private membersService: MembersService,
    private sorter: SortingService
  ) {}

  ngOnInit(): void {
    this.members$ = this.membersService.getMembersWithAttendances();
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
      })
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
}
