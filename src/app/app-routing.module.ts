import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'alumni',
    pathMatch: 'full',
  },
  {
    path: 'alumni',
    loadChildren: () =>
      import('./core/modules/alumni-management/alumni-management.module').then(
        (m) => m.AlumniManagementModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
