import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../modules/material/material.module';
import { LoaderComponent } from './loader/loader.component';

@NgModule({
  declarations: [ToolbarComponent, LoaderComponent],
  imports: [CommonModule, BrowserAnimationsModule, MaterialModule],
  exports: [ToolbarComponent, LoaderComponent],
})
export class SharedModule {}
