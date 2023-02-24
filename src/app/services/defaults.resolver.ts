import { Injectable } from '@angular/core';
import { Defaults } from '@models/defaults';
import { Observable } from 'rxjs';
import { DefaultsStore } from './defaults.store';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DefaultsResolver implements Resolve<Defaults> {
  constructor(private defaults: DefaultsStore) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Defaults> {
    return this.defaults.defaults$;
  }
}
