import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Attendance } from '@models/attendance';
import { Member } from '@models/member';
import { concatMap, from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  constructor(private db: AngularFirestore) {}

  getMembers(activeOnly: boolean = false): Observable<Member[]> {
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
        })
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

  getAttendeesForPractice(practiceId: string): Observable<Member[]> {
    return this.db
      .collectionGroup('attendances', (ref) =>
        ref.where('practiceId', '==', practiceId)
      )
      .get()
      .pipe(
        concatMap((attendances) => {
          const memberRefs = <string[]>attendances.docs.map((attendance) => {
            return attendance.ref.parent.parent.id;
          });
          return this.db
            .collection<Member>('members', (ref) =>
              ref.orderBy('lastName').orderBy('firstName')
            )
            .valueChanges({ idField: 'id' })
            .pipe(
              map((members: Member[]) => {
                return <Member[]>members
                  .filter((f) => memberRefs.includes(f.id))
                  .map((member) => {
                    return new Member({
                      ...member,
                    });
                  });
              })
            );
        })
      );
  }

  addMember(newMember: Partial<Member>): Observable<any> {
    return from(this.db.collection('members').add(newMember));
  }

  updateMember(memberId: string, changes: Partial<Member>): Observable<any> {
    return from(this.db.doc(`members/${memberId}`).update(changes));
  }

  deleteMember(memberId: string): Observable<any> {
    return from(this.db.doc(`members/${memberId}`).delete());
  }
}
