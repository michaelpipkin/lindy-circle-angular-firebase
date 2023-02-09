import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Practice } from '@models/practice';
import { concatMap, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PracticeService {
  constructor(private db: AngularFirestore) {}

  getPracticesForMember = (memberId: string): Observable<Practice[]> =>
    this.db
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

  getPractices = () =>
    this.db
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
