import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Practice } from '@models/practice';
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
export class PracticeService {
  constructor(
    private db: AngularFirestore,
    private loading: LoadingService,
    private snackBar: MatSnackBar
  ) {}

  getPractices() {
    this.loading.loadingOn();
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
        }),
        tap(() => this.loading.loadingOff())
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

  addPractice(practice: Partial<Practice>): Observable<any> {
    this.loading.loadingOn();
    return this.db
      .collection('practices', (ref) =>
        ref.orderBy('practiceNumber', 'desc').limit(1)
      )
      .get()
      .pipe(
        concatMap(async (res) => {
          let practiceNumber = 1;
          if (res.docs.length > 0) {
            practiceNumber = res.docs[0].data()['practiceNumber'] + 1;
          }
          const newPractice = {
            ...practice,
            practiceNumber: practiceNumber,
          };
          return await this.db.collection('practices').add(newPractice);
        }),
        catchError((err: Error) => {
          this.snackBar.open(
            'Something went wrong - could not add practice.',
            'Close',
            { verticalPosition: 'top' }
          );
          this.loading.loadingOff();
          return throwError(() => new Error(err.message));
        }),
        tap(() => this.loading.loadingOff())
      );
  }

  updatePractice = (
    practiceId: string,
    changes: Partial<Practice>
  ): Observable<any> =>
    from(this.db.doc(`practices/${practiceId}`).update(changes));

  deletePractice = (practiceId: string) =>
    from(this.db.doc(`practices/${practiceId}`).delete());
}
