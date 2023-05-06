import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { mergeMap, tap } from 'rxjs/operators';
import { Authentication } from 'src/app/core/models/auth';
import { IAuthUserDTO, IUserDTO } from 'src/app/core/models/user';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { TranscriptService } from 'src/app/core/services/transcript.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public loginForm: FormGroup;
  public email: string;
  public user: IUserDTO;

  constructor(private authenticationService: AuthenticationService,
    private userService: UserService,
    private transcriptService: TranscriptService,
    private router: Router,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  public async submit(): Promise<void> {
    if (this.loginForm.invalid) {
      this._snackBar.open("Please fill in the required details", null, {
        duration: 3000
      });

      return;
    }

    const payload: IAuthUserDTO = {
      email: this.loginForm.get('email').value,
      password: this.loginForm.get('password').value,
      returnSecureToken: true
    };

    this.loaderService.setLoader(true);
    this.authenticationService.signIn(payload).pipe(
      tap((auth: Authentication) => {
        this.email = auth.email;
        localStorage.setItem('userAccessToken', auth.idToken);
      }, error => {
        this._snackBar.open("Invalid Username and Password", null, {
          duration: 3000
        });
        this.loaderService.setLoader(false);
      }),
      mergeMap(() => this.userService.getUserByEmail(this.email))).subscribe((user: IUserDTO) => {
        this.userService.setUserDetails(user);

        if (user.role === 'student') {
          this.getTranscriptRecord(user.student_id);
        } else if (user.role === 'admin') {
          this.getAllUsers();
        }
      }, error => {
        this._snackBar.open("GetUserByEmail(): Error", null, {
          duration: 3000
        });
        this.loaderService.setLoader(false);
      });
  }

  private async getTranscriptRecord(studentId: string): Promise<void> {
    try {
      const transcripts = await this.transcriptService.getTranscriptByStudentId(studentId).toPromise();
      this.transcriptService.setTranscript(transcripts);
    } catch (e) {
      console.error(e);
    } finally {
      this.loaderService.setLoader(false);
      this.router.navigate(['alumni', 'home']);
    }
  }

  private async getAllUsers(): Promise<void> {
    try {
      const users = await this.userService.getUsers().toPromise();
      this.userService.setUsers(users);
    } catch (e) {
      console.error(e);
    } finally {
      this.loaderService.setLoader(false);
      this.router.navigate(['alumni', 'home']);
    }
  }

  public redirectToRegister(): void {
    this.router.navigate(['alumni', 'registration'])
  }
}
