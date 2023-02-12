import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Attendance } from '@models/attendance';
import { Member } from '@models/member';
import { LoadingService } from '@shared/loading/loading.service';
import {
  catchError,
  concatMap,
  from,
  map,
  Observable,
  tap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  constructor(
    private db: AngularFirestore,
    private router: Router,
    private loading: LoadingService,
    private snackBar: MatSnackBar
  ) {}

  getMembers(activeOnly: boolean = false): Observable<Member[]> {
    this.loading.loadingOn();
    return this.db
      .collection<Member>('members', (ref) =>
        ref
          .where('active', 'in', [true, activeOnly])
          .orderBy('lastName')
          .orderBy('firstName')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((members: Member[]) => {
          return <Member[]>members.map((member: Member) => {
            return new Member({
              ...member,
            });
          });
        }),
        tap(() => this.loading.loadingOff())
      );
  }

  // example of joining two collections
  getMembersWithAttendances(activeOnly: boolean = false): Observable<Member[]> {
    return this.db
      .collectionGroup('attendances')
      .get()
      .pipe(
        concatMap((res) => {
          const attendances = <Attendance[]>res.docs.map((snapshot) => {
            return snapshot.data();
          });
          return this.db
            .collection<Member>('members', (ref) =>
              ref
                .where('active', 'in', [true, activeOnly])
                .orderBy('lastName')
                .orderBy('firstName')
            )
            .valueChanges({ idField: 'id' })
            .pipe(
              map((members: Member[]) => {
                return <Member[]>members.map((member: Member) => {
                  return new Member({
                    ...member,
                    totalAttendance: attendances.filter(
                      (f) => f.memberId == member.id
                    ).length,
                  });
                });
              })
            );
        })
      );
  }

  getMemberDetails(memberId: string): Observable<Member | null> {
    this.loading.loadingOn();
    return this.db
      .doc(`members/${memberId}`)
      .valueChanges({ idField: 'id' })
      .pipe(
        map((member: Member) => {
          if (
            member.hasOwnProperty('firstName') &&
            member.hasOwnProperty('lastName') &&
            member.hasOwnProperty('active')
          ) {
            return new Member({
              ...member,
            });
          } else {
            return null;
          }
        })
      );
  }

  addMember = (newMember: Partial<Member>): Observable<any> =>
    from(this.db.collection('members').add(newMember));

  updateMember = (
    memberId: string,
    changes: Partial<Member>
  ): Observable<any> =>
    from(this.db.doc(`members/${memberId}`).update(changes));

  deleteMember(memberId: string) {
    this.loading.loadingOn();
    return from(this.db.doc(`members/${memberId}`).delete()).pipe(
      tap(() => {
        this.loading.loadingOff();
        this.router.navigateByUrl('/members');
      }),
      catchError((err: Error) => {
        this.snackBar.open(
          'Something went wrong - could not delete member.',
          'Close',
          {
            verticalPosition: 'top',
          }
        );
        this.loading.loadingOff();
        return throwError(() => new Error(err.message));
      })
    );
  }
}
