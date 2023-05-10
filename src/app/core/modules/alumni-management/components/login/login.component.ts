import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { mergeMap, tap } from 'rxjs/operators';
import { Authentication } from 'src/app/core/models/auth';
import { IAuthUserDTO, IUserDTO } from 'src/app/core/models/user';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { DocumentService } from 'src/app/core/services/document.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ERROR_SNACKBAR_OPTION } from 'src/app/core/models/snackbar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public form: FormGroup;
  public email: string;
  public user: IUserDTO;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private transcriptService: DocumentService,
    private router: Router,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar
  ) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  public async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this._snackBar.open(
        'Please fill in the required details',
        null,
        ERROR_SNACKBAR_OPTION
      );

      return;
    }

    const payload: IAuthUserDTO = {
      email: this.form.get('email').value,
      password: this.form.get('password').value,
      returnSecureToken: true,
    };

    this.loaderService.setLoader(true);
    this.authenticationService
      .signIn(payload)
      .pipe(
        tap((auth: Authentication) => {
          this.email = auth.email;
          localStorage.setItem('userAccessToken', auth.idToken);
        }),
        mergeMap(() => this.userService.getUserByEmail(this.email))
      )
      .subscribe(
        (user: IUserDTO) => {
          this.userService.setUserDetails(user);

          if (user.role === 'student') {
            this.getTranscriptRecord(user.student_id);
          } else if (user.role === 'admin') {
            this.getAllUsers();
          }
        },
        (error) => {
          this._snackBar.open(
            'Invalid Username and Password',
            null,
            ERROR_SNACKBAR_OPTION
          );
          console.log(error);
          this.loaderService.setLoader(false);
        }
      );
  }

  private async getTranscriptRecord(studentId: string): Promise<void> {
    try {
      const transcripts = await this.transcriptService
        .getTranscriptByStudentId(studentId)
        .toPromise();
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
    this.router.navigate(['alumni', 'registration']);
  }
}
