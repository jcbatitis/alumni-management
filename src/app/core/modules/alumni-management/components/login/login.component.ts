import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { mergeMap, tap } from 'rxjs/operators';
import { Authentication, Status } from 'src/app/core/models/auth';
import { IAuthUserDTO, IUserDTO } from 'src/app/core/models/user';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { DocumentService } from 'src/app/core/services/document.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ERROR_SNACKBAR_OPTION } from 'src/app/core/models/snackbar';
import { forkJoin } from 'rxjs';
import { Certificate } from 'src/app/core/models/certificate';
import { Transcript } from 'src/app/core/models/transcript';
import { UserDocument } from 'src/app/core/models/document';
import { CookieService } from 'ngx-cookie-service';

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
    private documentService: DocumentService,
    private router: Router,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar,
    private cookieService: CookieService
  ) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    const token = this.cookieService.get('userAccessToken');

    if (token) {
      this.loaderService.setLoader(true);
      this.authenticationService.checkIfValidSession().subscribe(
        (auth) => {
          if (auth.status === Status.OK) {
            this.getUserDetails(auth.email);
          }
        },
        (error) => {
          this.cookieService.delete('userAccessToken');

          this.loaderService.setLoader(false);
          this.router.navigate(['alumni', 'login']);
          console.error(error);
        }
      );
    }
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
      this.loaderService.setLoader(false);
    }
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

          this.cookieService.set('userAccessToken', auth.idToken);
        }),
        mergeMap(() => this.userService.getUserByEmail(this.email))
      )
      .subscribe(
        (user: IUserDTO) => {
          this.userService.setUserDetails(user);
          if (user.role === 'student') {
            const requests = [];
            requests.push(
              this.documentService.getTranscriptByStudentId(user.id)
            );
            requests.push(
              this.documentService.getCertificateByStudentId(user.id)
            );

            forkJoin(requests).subscribe((documents) => {
              const transcripts = documents[0] as Transcript;
              const certificate = documents[1] as Certificate;

              const userDocument: UserDocument = {
                transcripts,
                certificate,
              };

              this.documentService.setUserDocument(userDocument);
            });
          } else if (user.role === 'admin') {
            this.getAllUsers();
          }

          if (this.router.url.includes('verification')) {
            return;
          }

          this.router.navigate(['alumni', 'home']);
          this.loaderService.setLoader(false);
        },
        (error) => {
          const errorMessage = error?.error?.error?.message;
          const snackError = errorMessage ?? 'Invalid Username and Password';
          this._snackBar.open(snackError, null, ERROR_SNACKBAR_OPTION);
          this.loaderService.setLoader(false);
          console.log(error);
        }
      )
      .add(() => {});
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
