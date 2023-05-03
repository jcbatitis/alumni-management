import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlumniManagementComponent } from './alumni-management.component';

describe('AlumniManagementComponent', () => {
  let component: AlumniManagementComponent;
  let fixture: ComponentFixture<AlumniManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlumniManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlumniManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
