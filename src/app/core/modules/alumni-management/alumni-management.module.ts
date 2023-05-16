import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationComponent } from './components/registration/registration.component';
import { AlumniManagementComponent } from './alumni-management.component';
import { AlumniManagementRoutingModule } from './alumni-management-routing.module';
import { MaterialModule } from 'src/app/shared/modules/material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { VerificationComponent } from './components/verification/verification.component';
import { StudentDetailsComponent } from './components/student-details/student-details.component';
import { PipeModule } from '../../pipes/pipe.module';

import {
  RecaptchaModule,
  RECAPTCHA_SETTINGS,
  RecaptchaSettings,
  RecaptchaFormsModule,
  RECAPTCHA_V3_SITE_KEY,
  RecaptchaV3Module,
} from 'ng-recaptcha';

const RECAPTCHA_V3_KEY = '6LdYrBImAAAAAKV0xjnh4pgaTXh7OecBvZAQgqA8';
const RECAPTCHA_V2_KEY = '6LeDthImAAAAAIEL9ecmqzKUzeUk0sAQKPZKiIcZ';
@NgModule({
  declarations: [
    AlumniManagementComponent,
    RegistrationComponent,
    LoginComponent,
    HomeComponent,
    AdminComponent,
    VerificationComponent,
    StudentDetailsComponent,
  ],
  imports: [
    CommonModule,
    AlumniManagementRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    PipeModule.forRoot(),
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: RECAPTCHA_V2_KEY,
      } as RecaptchaSettings,
    },
  ],
})
export class AlumniManagementModule {}
