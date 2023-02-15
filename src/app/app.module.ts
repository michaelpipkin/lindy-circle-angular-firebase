import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingService } from '@shared/loading/loading.service';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { MaterialModule } from './material.module';
import { AddMemberComponent } from './members/add-member/add-member.component';
import { EditMemberComponent } from './members/edit-member/edit-member.component';
import { MemberDetailsComponent } from './members/member-details/member-details.component';
import { MembersComponent } from './members/members/members.component';
import { AddPracticeComponent } from './practices/add-practice/add-practice.component';
import { PracticesComponent } from './practices/practices/practices.component';
import { GenericDialogComponent } from './shared/generic-dialog/generic-dialog.component';
import { LoadingComponent } from './shared/loading/loading.component';
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialogConfig,
} from '@angular/material/dialog';
import {
  AngularFireAuthModule,
  USE_EMULATOR as USE_AUTH_EMULATOR,
} from '@angular/fire/compat/auth';
import {
  AngularFirestoreModule,
  USE_EMULATOR as USE_FIRESTORE_EMULATOR,
} from '@angular/fire/compat/firestore';
import {
  AngularFireFunctionsModule,
  USE_EMULATOR as USE_FUNCTIONS_EMULATOR,
} from '@angular/fire/compat/functions';
import { PracticeDetailsComponent } from './practices/practice-details/practice-details.component';
import { EditPracticeComponent } from './practices/edit-practice/edit-practice.component';
import { AddPunchCardComponent } from './punch-cards/add-punch-card/add-punch-card.component';
import { TransferPunchCardComponent } from './punch-cards/transfer-punch-card/transfer-punch-card.component';

@NgModule({
  declarations: [
    AppComponent,
    MembersComponent,
    PracticesComponent,
    AddMemberComponent,
    MemberDetailsComponent,
    EditMemberComponent,
    GenericDialogComponent,
    LoadingComponent,
    LoginComponent,
    AddPracticeComponent,
    PracticeDetailsComponent,
    EditPracticeComponent,
    AddPunchCardComponent,
    TransferPunchCardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
  ],
  providers: [
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        disableClose: true,
        autoFocus: true,
        width: '280px',
      } as MatDialogConfig,
    },
    {
      provide: USE_FIRESTORE_EMULATOR,
      useValue: environment.useEmulators ? ['localhost', 8080] : undefined,
    },
    {
      provide: USE_AUTH_EMULATOR,
      useValue: environment.useEmulators
        ? ['http://localhost:9099']
        : undefined,
    },
    {
      provide: USE_FUNCTIONS_EMULATOR,
      useValue: environment.useEmulators ? ['localhost', 5001] : undefined,
    },
    LoadingService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
