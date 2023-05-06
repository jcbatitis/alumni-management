import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '../../services/registration.service';
import { IAuthUserDTO, IUserDTO } from 'src/app/core/models/user';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RegistrationFields, ValidatorMessages } from 'src/app/core/models/fields';
import { mergeMap, tap } from 'rxjs/operators';
import { Authentication } from 'src/app/core/models/auth';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { TranscriptService } from 'src/app/core/services/transcript.service';
import { Grade, Transcript } from 'src/app/core/models/transcript';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  public userForm: FormGroup;
  public field = RegistrationFields;
  public errorMessage = ValidatorMessages;

  public authData: IAuthUserDTO = {} as IAuthUserDTO;

  public errorMessages = {
    'required': ' is required',
    'email': 'is in wrong format.'
  }

  constructor(
    private authService: AuthenticationService,
    private registrationService: RegistrationService,
    private userService: UserService,
    private transcriptService: TranscriptService,
    private router: Router,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar
  ) {
    this.userForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      middleName: new FormControl('', []),
      familyName: new FormControl('', [Validators.required]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  private studentId: string = `S${Math.floor(1000000 + Math.random() * 9000000).toString()}`;

  ngOnInit(): void {

  }

  public async submit(isAdmin: boolean = false): Promise<void> {
    if (this.userForm.invalid) {
      this._snackBar.open("Please fill in the required details", null, {
        duration: 3000
      });
      return;
    }

    const payload: IUserDTO = {
      first_name: this.userForm.get('firstName').value,
      middle_name: this.userForm.get('middleName').value,
      family_name: this.userForm.get('familyName').value,
      email: this.userForm.get('email').value,
      student_id: this.studentId,
      role: isAdmin ? 'admin' : 'student'
    };

    if (isAdmin) {
      delete payload.student_id;
    }

    this.loaderService.setLoader(true);

    this.authData.email = this.userForm.get('email').value;
    this.authData.password = this.userForm.get('password').value;
    this.authData.returnSecureToken = true;

    this.authService.signUp(this.authData).pipe(
      tap((auth: Authentication) => {
        localStorage.setItem('userAccessToken', auth.idToken);
      }, error => {
        this._snackBar.open("Email already taken!", null, {
          duration: 3000
        });
        this.loaderService.setLoader(false);
      }),
      mergeMap(() => this.registrationService.addUser(payload))).subscribe((user: IUserDTO) => {
        if (!isAdmin) {
          this.createTranscript();
        } else {
          this.loaderService.setLoader(false);
        }

        this.userService.setUserDetails(user);
        this.router.navigate(['alumni', 'home']);
      });
  }

  private setRandomGradeDetail(semester: string, year: string, ccIndex: number, cnIndex: number): Grade {
    const course_coordinators = [
      "Christian Kale",
      "Angelina Jelly",
      "Vladimir Poutine",
      "Arianna Grande Mocha Latteth",
      "Stephen Fries",
      "Steven Spielburger",
      "Andy Curry",
      "Nicole Kidneybeansman",
      "Christian Kale",
      "Bread Pitt",
      "Kanye Tuna",
      "Katy Perrier",
      "Andy Curry",
      "Vladimir Poutine",
      "Angelina Jelly",
      "Leonardo Dicappuccino",
    ];
    const course_code = `COSC${Math.floor(1000 + Math.random() * 9000).toString()}`;
    const course_name = [
      "Cooking Grades",
      "Database Key Club",
      "Programming Foodamentals",
      "Ant Man: Quantisation",
      "Database: Only Fan Traps",
      "Digital Strategy: The Never Ending Group Work Activity",
      "Routing: Finding the safest route to Flinder's Station",
      "IT Administration: How to use a printer",
      "Encryption: Encrypting code before leaving the company",
      "Github: How to not git commit in a relationship",
      "Github: How to delete master branch in your work",
      "Programming Foodamentals",
      "Marketing: Selling a 20 year old car for 15k in 2023",
      "Sales: How to jack up car prices with low stocks",
      "Transportation: How to hide from Myki Inspectors",
      "Routing: Finding the safest route to Flinder's Station",
    ];

    return {
      course_code: course_code,
      course_coordinator: course_coordinators[cnIndex],
      name: course_name[ccIndex],
      mark: Math.floor(Math.random() * (98 - 78 + 1) + 78).toString(),
      semester: semester,
      year: year,
      units: '12'
    };
  }

  private getRandomNumber(): number[] {
    var arr = [];
    while (arr.length < 16) {
      var r = Math.floor(Math.random() * 16);
      if (arr.indexOf(r) === -1) arr.push(r);
    }

    return arr
  }

  private async createTranscript(): Promise<void> {
    try {

      const courseCoordinatorRandomNum = this.getRandomNumber();
      const courseNameRandomNum = this.getRandomNumber();

      const grades: Grade[] = [];
      for (var x = 0; x < 16; x++) {
        let grade;

        if (x < 4) {
          grade = this.setRandomGradeDetail('Semester 1', '2021', courseCoordinatorRandomNum[x], courseNameRandomNum[x]);
        } else if (x > 3 && x < 8) {
          grade = this.setRandomGradeDetail('Semester 2', '2021', courseCoordinatorRandomNum[x], courseNameRandomNum[x]);
        }

        else if (x > 7 && x < 12) {
          grade = this.setRandomGradeDetail('Semester 1', '2022', courseCoordinatorRandomNum[x], courseNameRandomNum[x]);
        } else if (x > 11 && x <= 15) {
          grade = this.setRandomGradeDetail('Semester 2', '2022', courseCoordinatorRandomNum[x], courseNameRandomNum[x]);
        }

        grades.push(grade);
      }

      const payload: Transcript = {
        student_id: this.studentId,
        grades: grades
      };

      const transcripts = await this.transcriptService.createTranscript(payload).toPromise();
      this.transcriptService.setTranscript(transcripts);
    } catch (e) {
      console.error(e);
    } finally {
      this.loaderService.setLoader(false);
    }
  }

  public redirectToLogin(): void {
    this.router.navigate(['alumni', 'login'])
  }
}
