import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '../../services/registration.service';
import { IAuthUserDTO, IUserDTO } from 'src/app/core/models/user';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  RegistrationFields,
  ValidatorMessages,
} from 'src/app/core/models/fields';
import { mergeMap, tap } from 'rxjs/operators';
import { Authentication } from 'src/app/core/models/auth';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { DocumentService } from 'src/app/core/services/document.service';
import { Grade, Transcript } from 'src/app/core/models/transcript';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Certificate } from 'src/app/core/models/certificate';
import { forkJoin } from 'rxjs';
import { ERROR_SNACKBAR_OPTION } from 'src/app/core/models/snackbar';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  public form: FormGroup;
  public field = RegistrationFields;
  public errorMessage = ValidatorMessages;
  public transcriptId: string = `22${Math.floor(
    1000 + Math.random() * 9000
  ).toString()}`;

  public authData: IAuthUserDTO = {} as IAuthUserDTO;

  public errorMessages = {
    required: ' is required',
    email: 'is in wrong format.',
  };

  constructor(
    private authService: AuthenticationService,
    private registrationService: RegistrationService,
    private userService: UserService,
    private documentService: DocumentService,
    private router: Router,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar
  ) {
    this.form = new FormGroup(
      {
        studentId: new FormControl('', [Validators.required]),
        firstName: new FormControl('', [Validators.required]),
        middleName: new FormControl('', []),
        familyName: new FormControl('', [Validators.required]),
        mobileNumber: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
    );
  }

  // private studentId: string = `S${Math.floor(1000000 + Math.random() * 9000000).toString()}`;

  ngOnInit(): void {}

  private checkPassword(): boolean {
    const password = this.form.get('password').value;
    const confirmPassword = this.form.get('confirmPassword').value;

    return password === confirmPassword ? true : false;
  }

  public async submit(isAdmin: boolean = false): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this._snackBar.open('Please fill in the required details', null, ERROR_SNACKBAR_OPTION);
      return;
    }

    if (!this.checkPassword()) {
      this._snackBar.open(
        'Password and Confirm Password is not the same',
        null,
        ERROR_SNACKBAR_OPTION
      );
      return;
    }

    const payload: IUserDTO = {
      first_name: this.form.get('firstName').value,
      middle_name: this.form.get('middleName').value,
      family_name: this.form.get('familyName').value,
      email: this.form.get('email').value,
      id: this.form.get('studentId').value,
      mobile_number: this.form.get('mobileNumber').value,
      role: isAdmin ? 'admin' : 'student',
    };

    if (isAdmin) {
      delete payload.id;
    }

    this.loaderService.setLoader(true);

    this.authData.email = this.form.get('email').value;
    this.authData.password = this.form.get('password').value;
    this.authData.returnSecureToken = true;

    this.authService
      .signUp(this.authData)
      .pipe(
        tap(
          (auth: Authentication) => {
            localStorage.setItem('userAccessToken', auth.idToken);
          },
          (error) => {
            this._snackBar.open(
              'Email already taken!',
              null,
              ERROR_SNACKBAR_OPTION
            );
            this.loaderService.setLoader(false);
          }
        ),
        mergeMap(() => this.registrationService.addUser(payload))
      )
      .subscribe((user: IUserDTO) => {
        if (!isAdmin) {
          this.createDocuments();
        } else {
          this.loaderService.setLoader(false);
        }

        this.userService.setUserDetails(user);
        this.router.navigate(['alumni', 'home']);
      });
  }

  private setRandomGradeDetail(
    semester: string,
    year: string,
    ccIndex: number,
    cnIndex: number
  ): Grade {
    const course_coordinators = [
      'Christian Kale',
      'Angelina Jelly',
      'Vladimir Poutine',
      'Arianna Grande Mocha Latteth',
      'Stephen Fries',
      'Steven Spielburger',
      'Andy Curry',
      'Nicole Kidneybeansman',
      'Christian Kale',
      'Bread Pitt',
      'Kanye Tuna',
      'Katy Perrier',
      'Andy Curry',
      'Vladimir Poutine',
      'Angelina Jelly',
      'Leonardo Dicappuccino',
    ];
    const course_code = `COSC${Math.floor(
      1000 + Math.random() * 9000
    ).toString()}`;
    const course_name = [
      'Cooking Grades',
      'Database Key Club',
      'Programming Foodamentals',
      'Ant Man: Quantisation',
      'Database: Only Fan Traps',
      'Digital Strategy: The Never Ending Group Work Activity',
      "Routing: Finding the safest route to Flinder's Station",
      'IT Administration: How to use a printer',
      'Encryption: Encrypting code before leaving the company',
      'Github: How to not git commit in a relationship',
      'Github: How to delete master branch in your work',
      'Programming Foodamentals',
      'Marketing: Selling a 20 year old car for 15k in 2023',
      'Sales: How to jack up car prices with low stocks',
      'Transportation: How to hide from Myki Inspectors',
      "Routing: Finding the safest route to Flinder's Station",
    ];

    return {
      course_code: course_code,
      course_coordinator: course_coordinators[cnIndex],
      name: course_name[ccIndex],
      mark: Math.floor(Math.random() * (98 - 78 + 1) + 78).toString(),
      semester: semester,
      year: year,
      units: '12',
    };
  }

  private getRandomNumber(): number[] {
    var arr = [];
    while (arr.length < 16) {
      var r = Math.floor(Math.random() * 16);
      if (arr.indexOf(r) === -1) arr.push(r);
    }

    return arr;
  }

  private async createDocuments(): Promise<void> {
    const courseCoordinatorRandomNum = this.getRandomNumber();
    const courseNameRandomNum = this.getRandomNumber();

    const grades: Grade[] = [];
    for (var x = 0; x < 16; x++) {
      let grade;

      if (x < 4) {
        grade = this.setRandomGradeDetail(
          'Semester 1',
          '2020',
          courseCoordinatorRandomNum[x],
          courseNameRandomNum[x]
        );
      } else if (x > 3 && x < 8) {
        grade = this.setRandomGradeDetail(
          'Semester 2',
          '2020',
          courseCoordinatorRandomNum[x],
          courseNameRandomNum[x]
        );
      } else if (x > 7 && x < 12) {
        grade = this.setRandomGradeDetail(
          'Semester 1',
          '2021',
          courseCoordinatorRandomNum[x],
          courseNameRandomNum[x]
        );
      } else if (x > 11 && x <= 15) {
        grade = this.setRandomGradeDetail(
          'Semester 2',
          '2021',
          courseCoordinatorRandomNum[x],
          courseNameRandomNum[x]
        );
      }

      grades.push(grade);
    }

    const transcriptPayload: Transcript = {
      student_id: this.form.get('studentId').value,
      grades: grades,
    };

    const certificatePayload: Certificate = {
      certificate_id: this.transcriptId,
      student_id: this.form.get('studentId').value,
    };

    const requests = [];
    requests.push(this.documentService.createTranscript(transcriptPayload));
    requests.push(this.documentService.createCertificate(certificatePayload));

    forkJoin(requests).subscribe((documents) => {
      const transcript = documents[0] as Transcript;
      this.documentService.setTranscript(transcript);
      this.loaderService.setLoader(false);
    });
  }

  public redirectToLogin(): void {
    this.router.navigate(['alumni', 'login']);
  }
}
