import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Member } from '@models/member';
import { MemberService } from '@services/member.service';
import { SortingService } from '@services/sorting.service';
import { UserService } from '@services/user.service';
import { LoadingService } from '@shared/loading/loading.service';
import { map, Observable, tap } from 'rxjs';
import { AddMemberComponent } from '../add-member/add-member.component';

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
  columnsToDisplay: string[] = [
    'firstName',
    'lastName',
    'activeText',
    'punchesRemaining',
  ];

  constructor(
    private memberService: MemberService,
    public user: UserService,
    private sorter: SortingService,
    private router: Router,
    private dialog: MatDialog,
    private loading: LoadingService
  ) {}

  ngOnInit(): void {
    this.loading.loadingOn();
    this.members$ = this.memberService
      .getMembers()
      .pipe(tap(() => this.loading.loadingOff()));
    this.filterMembers();
  }

  filterMembers(): void {
    this.filteredMembers$ = this.members$.pipe(
      map((members: Member[]) => {
        let filteredMembers: Member[] = members.filter(
          (member: Member) =>
            (member.active || member.active == this.activeOnly) &&
            (member.firstName
              .toLowerCase()
              .includes(this.nameFilter.toLowerCase()) ||
              member.lastName
                .toLowerCase()
                .includes(this.nameFilter.toLowerCase()))
        );
        if (filteredMembers.length > 0) {
          filteredMembers = this.sorter.sort(
            filteredMembers,
            this.sortField,
            this.sortAsc
          );
        }
        return filteredMembers;
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

  onRowClick(member: Member) {
    this.user.roles$
      .pipe(
        tap((roles) => {
          if (roles.admin) {
            this.router.navigate(['members', member.id]);
          }
        })
      )
      .subscribe();
  }

  addMember(): void {
    this.dialog.open(AddMemberComponent);
  }
}
