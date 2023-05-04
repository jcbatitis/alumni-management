import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUserDTO } from 'src/app/core/models/user';
import { UserService } from 'src/app/core/modules/alumni-management/services/user.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TranscriptService } from 'src/app/core/services/transcript.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService,
    private userService: UserService,
    private transcriptService: TranscriptService,
    private router: Router,
    private loaderService: LoaderService) {
  }

  public userDetail: IUserDTO;

  ngOnInit(): void {
    this.userService.userDetailsLoaded$.subscribe(isLoaded => {
      this.userDetail = this.userService.userDetail;
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

    }, 1000)


  }

}