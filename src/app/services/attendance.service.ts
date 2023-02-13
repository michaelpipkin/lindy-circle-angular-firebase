import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Attendance } from '@models/attendance';
import { Member } from '@models/member';
import { concatMap, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  constructor(private db: AngularFirestore) {}

  getAttendancesForPractice(practiceId: string): Observable<Attendance[]> {
    return this.db
      .collection('members')
      .get()
      .pipe(
        concatMap((res) => {
          const members = <Member[]>res.docs.map((snapshot) => {
            return {
              id: snapshot.id,
              ...(<Member>snapshot.data()),
            };
          });
          return this.db
            .collection<Attendance>(`practices/${practiceId}/attendances`)
            .valueChanges({ idField: 'id' })
            .pipe(
              map((attendances: Attendance[]) => {
                return <Attendance[]>attendances.map(
                  (attendance: Attendance) => {
                    const member = new Member(
                      members.find((f) => f.id == attendance.memberId)
                    );
                    return new Attendance({
                      ...attendance,
                      memberName: member.firstLastName,
                    });
                  }
                );
              })
            );
        })
      );
  }
}
