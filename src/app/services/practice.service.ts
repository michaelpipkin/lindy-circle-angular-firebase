import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Practice } from '@models/practice';
import { catchError, concatMap, from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PracticeService {
  constructor(private db: AngularFirestore) {}

  getPractices(): Observable<Practice[]> {
    return this.db
      .collection('practices')
      .valueChanges({ idField: 'id' })
      .pipe(
        map((practices: Practice[]) => {
          return <Practice[]>practices.map((practice: Practice) => {
            return new Practice({
              ...practice,
            });
          });
        })
      );
  }

  getPracticeDetails(practiceId: string): Observable<Practice | null> {
    return this.db
      .doc(`practices/${practiceId}`)
      .valueChanges({ idField: 'id' })
      .pipe(
        map((practice: Practice) => {
          if (
            practice.hasOwnProperty('practiceNumber') &&
            practice.hasOwnProperty('practiceDate')
          ) {
            return new Practice({
              ...practice,
            });
          } else {
            return null;
          }
        })
      );
  }

  getPracticesForMember(memberId: string): Observable<Practice[]> {
    return this.db
      .collectionGroup('attendances', (ref) =>
        ref.where('memberId', '==', memberId)
      )
      .get()
      .pipe(
        concatMap((attendances) => {
          const practiceRefs = <string[]>attendances.docs.map((attendance) => {
            return attendance.ref.parent.parent.id;
          });
          return this.db
            .collection<Practice>('practices', (ref) =>
              ref.orderBy('practiceNumber')
            )
            .valueChanges({ idField: 'id' })
            .pipe(
              map((practices: Practice[]) => {
                return <Practice[]>practices
                  .filter((f) => practiceRefs.includes(f.id))
                  .map((practice) => {
                    return new Practice({
                      ...practice,
                    });
                  });
              })
            );
        })
      );
  }

  isPracticeNumberValid(practiceNumber: number): boolean {
    return (
      this.db.collection('practices', (ref) =>
        ref.where('practiceNumber', '==', practiceNumber)
      ).doc === null
    );
  }

  addPractice(practice: Partial<Practice>): Observable<any> {
    return this.db
      .collection('practices', (ref) =>
        ref.orderBy('practiceNumber', 'desc').limit(1)
      )
      .get()
      .pipe(
        concatMap((res) => {
          let practiceNumber = 1;
          if (res.docs.length > 0) {
            practiceNumber = res.docs[0].data()['practiceNumber'] + 1;
          }
          const newPractice = {
            ...practice,
            practiceNumber: practiceNumber,
          };
          return this.db.collection('practices').add(newPractice);
        })
      );
  }

  updatePractice(
    practiceId: string,
    changes: Partial<Practice>
  ): Observable<any> {
    return from(this.db.doc(`practices/${practiceId}`).update(changes));
  }

  deletePractice(practiceId: string): Observable<any> {
    return from(this.db.doc(`practices/${practiceId}`).delete());
  }
}
