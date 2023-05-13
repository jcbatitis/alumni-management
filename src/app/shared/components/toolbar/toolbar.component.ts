import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { IUserDTO } from 'src/app/core/models/user';
import { UserService } from 'src/app/core/modules/alumni-management/services/user.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { DocumentService } from 'src/app/core/services/document.service';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private transcriptService: DocumentService,
    private router: Router,
    private loaderService: LoaderService,
    private cookieService: CookieService
  ) {}

  public userDetail: IUserDTO;

  ngOnInit(): void {
    this.userService.userDetailsLoaded$.subscribe((isLoaded) => {
      this.userDetail = this.userService.userDetail;
    });
  }

  public logout(): void {
    this.loaderService.setLoader(true);

    setTimeout(() => {
      this.cookieService.delete('userAccessToken', '/');
      this.userService.setUserDetails(null);
      this.userService.setUsers(null);
      this.transcriptService.setUserDocument(null);

      this.router.navigate(['alumni', 'login']);
      this.loaderService.setLoader(false);
    }, 1000);
  }

  redirectToLogin(): void {
    this.router.navigate(['alumni', 'login']);
  }

  redirectToVerification(): void {
    this.router.navigate(['alumni', 'verification']);
  }

  redirectToInterfacePicker(): void {
    this.router.navigate(['rmit']);
  }
}
