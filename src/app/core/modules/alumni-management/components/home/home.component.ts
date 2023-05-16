import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { IUserDTO } from 'src/app/core/models/user';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DocumentService } from 'src/app/core/services/document.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private loaderService: LoaderService,
    private transcriptService: DocumentService,
    private cookieService: CookieService
  ) {}
  public userDetail: IUserDTO;
  public name: string;

  public get fullName(): string {
    if (!this.userDetail) {
      return;
    }

    let name = '';

    name = `${this.userDetail.first_name}`;

    if (this.userDetail.middle_name) {
      name += ` ${this.userDetail.middle_name}`;
    }

    name += ` ${this.userDetail.family_name}`;

    return name;
  }

  ngOnInit(): void {
    console.log('home.component');

    const token = this.cookieService.get('userAccessToken');
    if (!token) {
      this.router.navigate(['alumni', 'login']);
    }

    this.userService.userDetailsLoaded$.subscribe((isLoaded) => {
      if (isLoaded) {
        this.userDetail = this.userService.userDetail;
      }
    });
  }

  public logout(): void {
    this.loaderService.setLoader(true);

    setTimeout(() => {
      this.cookieService.delete('userAccessToken');

      this.userService.setUserDetails(null);
      this.userService.setUsers(null);
      this.transcriptService.setUserDocument(null);

      this.router.navigate(['alumni', 'login']);
      this.loaderService.setLoader(false);
    }, 1000);
  }
}
