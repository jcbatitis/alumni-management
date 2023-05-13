import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './core/services/authentication.service';
import { Status } from './core/models/auth';
import { UserService } from './core/modules/alumni-management/services/user.service';
import { Router } from '@angular/router';
import { DocumentService } from './core/services/document.service';
import { LoaderService } from './core/services/loader.service';
import { forkJoin } from 'rxjs';
import { Transcript } from './core/models/transcript';
import { Certificate } from './core/models/certificate';
import { UserDocument } from './core/models/document';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public isLoading: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private documentService: DocumentService,
    private router: Router,
    private loaderService: LoaderService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    console.log('v2');
    const token = this.cookieService.get('userAccessToken');

    if (token) {
      this.isLoading = true;

      this.authenticationService.checkIfValidSession().subscribe(
        (auth) => {
          if (auth.status === Status.OK) {
            this.getUserDetails(auth.email);
          }
        },
        (error) => {
          this.cookieService.delete('userAccessToken', '/');
          this.isLoading = false;
          this.router.navigate(['alumni', 'login']);
          console.error(error);
        }
      );
    }

    this.loaderService.loader$.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });
  }

  private async getUserDetails(email: string): Promise<void> {
    try {
      const userDetails = await this.userService
        .getUserByEmail(email)
        .toPromise();
      this.userService.setUserDetails(userDetails);

      if (userDetails.role === 'student') {
        const requests = [];
        requests.push(
          this.documentService.getTranscriptByStudentId(userDetails.id)
        );
        requests.push(
          this.documentService.getCertificateByStudentId(userDetails.id)
        );

        forkJoin(requests).subscribe((documents) => {
          const transcripts = documents[0] as Transcript;
          const certificate = documents[1] as Certificate;

          const userDocument: UserDocument = {
            transcripts,
            certificate,
          };

          this.documentService.setUserDocument(userDocument);
          this.loaderService.setLoader(false);
        });
      } else if (userDetails.role === 'admin') {
        await this.getAllUsers();
      }

      if (this.router.url.includes('verification')) {
        return;
      }

      this.router.navigate(['alumni', 'home']);
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  }

  private async getAllUsers(): Promise<void> {
    try {
      const users = await this.userService.getUsers().toPromise();
      this.userService.setUsers(users);
    } catch (e) {
      console.error(e);
    }
  }
}
