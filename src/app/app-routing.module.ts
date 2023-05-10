import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InterfacePickerComponent } from './shared/components/interface-picker/interface-picker.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'rmit',
    pathMatch: 'full',
  },
  {
    path: 'alumni',
    loadChildren: () =>
      import('./core/modules/alumni-management/alumni-management.module').then(
        (m) => m.AlumniManagementModule
      ),
  },
  {
    path: 'rmit',
    component: InterfacePickerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
