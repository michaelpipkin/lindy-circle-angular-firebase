import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Attendance } from '@models/attendance';
import { Member } from '@models/member';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';

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
      .get()
      .pipe(
        switchMap((members) => {
          const memberIds = members.docs.map((member) => member.id);
          return combineLatest(
            of(members),
            combineLatest(
              memberIds.map((memberId) =>
                this.db
                  .collectionGroup<Attendance>('attendances', (ref) =>
                    ref.where('memberId', '==', memberId)
                  )
                  .get()
                  .pipe(
                    map((attendances) => {
                      return {
                        memberId: memberId,
                        attendances: attendances.size,
                      };
                    })
                  )
              )
            )
          );
        }),
        map(([members, attendances]) => {
          return <Member[]>members.docs.map(
            (snapshot: { id: string; data: () => any }) => {
              return new Member({
                id: snapshot.id,
                ...snapshot.data(),
                totalAttendance: attendances.find(
                  (a) => a.memberId == snapshot.id
                ).attendances,
              });
            }
          );
        })
      );
}

// this.db
//   .collection<Member>('members', (ref) =>
//     ref
//       .where('active', 'in', [true, activeOnly])
//       .orderBy('lastName')
//       .orderBy('firstName')
//   )
//   .get()
//   .pipe(
//     map((res) => {
//       return <Member[]>res.docs.map(
//         (snapshot: { id: string; data: () => any }) => {
//           return new Member({
//             id: snapshot.id,
//             ...snapshot.data(),
//           });
//         }
//       );
//     })
//   );
