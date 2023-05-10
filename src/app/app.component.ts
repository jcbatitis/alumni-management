import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './core/services/authentication.service';
import { Status } from './core/models/auth';
import { UserService } from './core/modules/alumni-management/services/user.service';
import { Router } from '@angular/router';
import { DocumentService } from './core/services/document.service';
import { LoaderService } from './core/services/loader.service';

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
    private transcriptService: DocumentService,
    private router: Router,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('userAccessToken');

    if (token) {
      this.isLoading = true;

      this.authenticationService.checkIfValidSession().subscribe(
        (auth) => {
          if (auth.status === Status.OK) {
            this.getUserDetails(auth.email);
          }
        },
        (error) => {
          localStorage.removeItem('userAccessToken');
          this.isLoading = false;
          this.router.navigate(['alumni', 'login']);
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
        await this.getTranscriptRecord(userDetails.student_id);
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

  private async getTranscriptRecord(studentId: string): Promise<void> {
    try {
      const transcripts = await this.transcriptService
        .getTranscriptByStudentId(studentId)
        .toPromise();
      this.transcriptService.setTranscript(transcripts);
    } catch (e) {
      console.error(e);
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
