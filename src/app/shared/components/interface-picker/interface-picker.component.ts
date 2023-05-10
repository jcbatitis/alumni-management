import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-interface-picker',
  templateUrl: './interface-picker.component.html',
  styleUrls: ['./interface-picker.component.scss'],
})
export class InterfacePickerComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  redirectToLogin(): void {
    this.router.navigate(['alumni', 'login']);
  }

  redirectToVerification(): void {
    this.router.navigate(['alumni', 'verification']);
  }
}
