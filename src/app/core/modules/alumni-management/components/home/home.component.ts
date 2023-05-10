import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { IUserDTO } from 'src/app/core/models/user';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DocumentService } from 'src/app/core/services/document.service';

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
    private transcriptService: DocumentService
  ) {}
  public userDetail: IUserDTO;

  ngOnInit(): void {
    const token = localStorage.getItem('userAccessToken');
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
      localStorage.removeItem('userAccessToken');
      this.userService.setUserDetails(null);
      this.userService.setUsers(null);
      this.transcriptService.setTranscript(null);

      this.router.navigate(['alumni', 'login']);
      this.loaderService.setLoader(false);
    }, 1000);
  }
}
