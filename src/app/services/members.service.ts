import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Attendance } from '@models/attendance';
import { Member } from '@models/member';
import { concatMap, from, map, Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  constructor(private db: AngularFirestore) {}

  getMembers = (activeOnly: boolean = false): Observable<Member[]> =>
    this.db
      .collection<Member>('members', (ref) =>
        ref
          .where('active', 'in', [true, activeOnly])
          .orderBy('lastName')
          .orderBy('firstName')
      )
      .valueChanges({ idField: 'id' })
      .pipe(
        map((members) => {
          return <Member[]>members.map((member) => {
            return new Member({
              ...member,
            });
          });
        })
      );

  // example of joining two collections
  getMembersWithAttendances = (
    activeOnly: boolean = false
  ): Observable<Member[]> =>
    this.db
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
              map((members) => {
                return <Member[]>members.map((member) => {
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

  getMemberDetails = (memberId: string): Observable<Member> =>
    this.db
      .doc<Member>(`members/${memberId}`)
      .valueChanges({ idField: 'id' })
      .pipe(
        map((member) => {
          return new Member({
            ...member,
          });
        })
      );

  addMember = (newMember: Partial<Member>): Observable<any> =>
    from(this.db.collection('members').add(newMember));

  updateMember = (
    memberId: string,
    changes: Partial<Member>
  ): Observable<any> =>
    from(this.db.doc(`members/${memberId}`).update(changes));

  deleteMember = (memberId: string) =>
    from(this.db.doc(`members/${memberId}`).delete());
}
