import { Component } from '@angular/core';
import { Defaults } from '@models/defaults';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-main',
  templateUrl: './admin-main.component.html',
  styleUrls: ['./admin-main.component.scss'],
})
export class AdminMainComponent {
  defaultValues$: Observable<Defaults>;
}
