import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlumniManagementComponent } from './alumni-management.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { VerificationComponent } from './components/verification/verification.component';

const routes: Routes = [
  {
    path: '',
    component: AlumniManagementComponent,
    children: [
      { path: '', redirectTo: 'login' },
      {
        path: 'registration',
        component: RegistrationComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'verification',
        component: VerificationComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlumniManagementRoutingModule { }
