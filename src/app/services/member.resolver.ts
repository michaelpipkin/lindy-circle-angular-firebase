import { Injectable } from '@angular/core';
import { Practice } from '@models/practice';
import { Observable } from 'rxjs';
import { PracticeService } from './practice.service';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MemberResolver implements Resolve<Practice[]> {
  constructor(private practiceServie: PracticeService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Practice[]> {
    const memberId: string = route.paramMap.get('id');
    return this.practiceServie.getPracticesForMember(memberId);
  }
}
