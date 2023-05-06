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
  ],
  providers: [],
})
export class AlumniManagementModule {}
