import { NgModule } from '@angular/core';
import { SafePipe } from './safe.pipe';

@NgModule({
  imports: [],
  declarations: [SafePipe],
  exports: [SafePipe],
})
export class PipeModule {
  static forRoot() {
    return {
      ngModule: PipeModule,
      providers: [],
    };
  }
}
