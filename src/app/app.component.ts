import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Member } from '@models/member';
import { importData } from '@services/db-utils';
import { MemberService } from '@services/member.service';
import { UserService } from '@services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'The Lindy Circle';
  members$: Observable<Member[]>;

  constructor(
    private db: AngularFirestore,
    public user: UserService,
    private membersService: MemberService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.members$ = this.membersService.getMembers();
  }

  logout(): void {
    this.user.logout();
  }

  onImportClick() {
    importData(this.db);
  }
}
