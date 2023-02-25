import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Attendance, paymentType } from '@models/attendance';
import { Member } from '@models/member';
import { increment } from 'firebase/firestore';
import { concatMap, from, map, Observable } from 'rxjs';

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
            return new Member({
              id: snapshot.id,
              ...(<Member>snapshot.data()),
            });
          });
          return this.db
            .collection<Attendance>(`practices/${practiceId}/attendances`)
            .valueChanges({ idField: 'id' })
            .pipe(
              map((attendances: Attendance[]) => {
                return <Attendance[]>attendances.map(
                  (attendance: Attendance) => {
                    const member = members.find(
                      (f) => f.id == attendance.memberId
                    );
                    return new Attendance({
                      ...attendance,
                      member: member,
                    });
                  }
                );
              })
            );
        })
      );
  }

  addAttendance(
    attendance: Partial<Attendance>,
    practiceId: string
  ): Observable<any> {
    const batch = this.db.firestore.batch();
    attendance.id = this.db.createId();
    const attendanceRef = this.db.doc(
      `/practices/${practiceId}/attendances/${attendance.id}`
    ).ref;
    const practiceRef = this.db.doc(`/practices/${practiceId}`).ref;
    const memberRef = this.db.doc(`/members/${attendance.memberId}`).ref;
    batch.set(attendanceRef, attendance);
    batch.update(practiceRef, {
      attendanceCount: increment(1),
      admissionRevenue: increment(attendance.paymentAmount),
    });
    if (attendance.paymentType === paymentType.PunchCard) {
      const punchCardRef = this.db.doc(
        `/punch-cards/${attendance.punchCardId}`
      ).ref;
      batch.update(memberRef, {
        totalAttendance: increment(1),
        punchesRemaining: increment(-1),
      });
      batch.update(punchCardRef, {
        punchesRemaining: increment(-1),
      });
    } else {
      batch.update(memberRef, {
        totalAttendance: increment(1),
        attendancePaymentTotal: increment(attendance.paymentAmount),
        totalPaid: increment(attendance.paymentAmount),
      });
    }
    return from(batch.commit());
  }

  deleteAttendance(
    attendance: Partial<Attendance>,
    practiceId: string
  ): Observable<any> {
    const batch = this.db.firestore.batch();
    const attendanceRef = this.db.doc(
      `/practices/${practiceId}/attendances/${attendance.id}`
    ).ref;
    const practiceRef = this.db.doc(`/practices/${practiceId}`).ref;
    const memberRef = this.db.doc(`/members/${attendance.memberId}`).ref;
    batch.delete(attendanceRef);
    batch.update(practiceRef, {
      attendanceCount: increment(-1),
      admissionRevenue: increment(-attendance.paymentAmount),
    });
    if (attendance.paymentType === paymentType.PunchCard) {
      const punchCardRef = this.db.doc(
        `/punch-cards/${attendance.punchCardId}`
      ).ref;
      batch.update(memberRef, {
        totalAttendance: increment(-1),
        punchesRemaining: increment(1),
      });
      batch.update(punchCardRef, {
        punchesRemaining: increment(1),
      });
    } else {
      batch.update(memberRef, {
        totalAttendance: increment(-1),
        attendancePaymentTotal: increment(-attendance.paymentAmount),
        totalPaid: increment(-attendance.paymentAmount),
      });
    }
    return from(batch.commit());
  }
}
