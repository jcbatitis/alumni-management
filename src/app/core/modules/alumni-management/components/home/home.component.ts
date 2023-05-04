import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { IUserDTO } from 'src/app/core/models/user';
import { FormGroup } from '@angular/forms';
import { TranscriptService } from 'src/app/core/services/transcript.service';
import { Grade } from 'src/app/core/models/transcript';

import jsPDF, { jsPDFOptions } from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public userForm: FormGroup;

  displayedColumns: string[] = ['year', 'course_code', 'name', 'units', 'mark', 'grade'];
  userColumns: string[] = ['student_id', 'first_name', 'middle_name', 'family_name', 'email', 'select'];

  public transcriptSource: MatTableDataSource<Grade>;
  public studentsSource: MatTableDataSource<IUserDTO>;

  public userDetail: IUserDTO;
  public transcriptRecord: Grade[];
  public listOfUsers: IUserDTO[];
  private transcriptRecordStudentId: string;

  public tabIndex: number = 1;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private userService: UserService,
    private transcriptService: TranscriptService,
    private router: Router,
    private loaderService: LoaderService,
    private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    const token = localStorage.getItem('userAccessToken');
    if (!token) {
      this.router.navigate(['alumni', 'login']);
    }

    if (this.userService?.userList) {
      this.listOfUsers = this.userService.userList.filter(user => user.role === 'student');
      this.studentsSource = new MatTableDataSource(this.listOfUsers);
    }

    if (this.userService?.userDetail) {
      this.userDetail = this.userService.userDetail;
    }

    if (this.transcriptService?.userTranscript?.grades) {
      this.transcriptRecord = this.transcriptService.userTranscript.grades;
      this.transcriptRecordStudentId = this.transcriptService.userTranscript.student_id;
      this.transcriptSource = new MatTableDataSource(this.transcriptRecord);
      this.transcriptSource.paginator = this.paginator;
    }

    this.userService.allUsersLoaded$.subscribe(isLoaded => {
      if (isLoaded) {
        this.listOfUsers = this.userService.userList.filter(user => user.role === 'student');
        this.studentsSource = new MatTableDataSource(this.listOfUsers);
      }
    });

    this.userService.userDetailsLoaded$.subscribe(isLoaded => {
      if (isLoaded) {
        this.userDetail = this.userService.userDetail;
      }
    });

    this.transcriptService.transcriptsLoaded$.subscribe(isLoaded => {
      if (isLoaded) {
        this.transcriptRecord = this.transcriptService.userTranscript.grades;
        this.transcriptRecordStudentId = this.transcriptService.userTranscript.student_id;
        this.transcriptSource = new MatTableDataSource(this.transcriptRecord);
      }
    });
  }

  public applyTranscriptFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.transcriptSource.filter = filterValue.trim().toLowerCase();
  }

  public applyStudentFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.studentsSource.filter = filterValue.trim().toLowerCase();
  }

  public async getTranscriptRecord(student: IUserDTO): Promise<void> {
    try {
      this.loaderService.setLoader(true);
      const transcripts = await this.transcriptService.getTranscriptByStudentId(student.student_id).toPromise();
      this.transcriptService.setTranscript(transcripts);
    } catch (e) {
      console.error(e);
    } finally {
      this.tabChange();
      this.loaderService.setLoader(false);
    }
  }

  public tabChange(): void {
    this.tabIndex = 2;
  }

  public downloadTranscript(): void {
    let jsPdfOptions: jsPDFOptions = {
      orientation: 'p',
      unit: 'pt',
      format: "a4"
    };
    const pdf = new jsPDF(jsPdfOptions);

    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    var pageWidth = pdf.internal.pageSize.width || pdf.internal.pageSize.getWidth();

    pdf.setTextColor('#000000');
    pdf.setFont('sans-serif');

    var rmitLogo = new Image();
    rmitLogo.src = './assets/images/rmit-logo.png'
    pdf.addImage(rmitLogo, 'png', 25, 40, 150, 60)

    pdf.setFontSize(14);
    pdf.text('ACADEMIC TRANSCRIPT', 390, 60);

    let name = "";
    if (this.userDetail.role === 'admin') {
      const studentTranscript = this.listOfUsers.find(user => user.student_id === this.transcriptRecordStudentId);
      name = `${studentTranscript.first_name} ${studentTranscript.family_name}`
    } else {
      name = `${this.userDetail.first_name} ${this.userDetail.family_name}`;
    }

    pdf.text(name, 30, 150);
    pdf.text('Student Number', 30, 170);

    const student_id = this.userDetail.role === 'admin' ? this.transcriptRecordStudentId : this.userDetail.student_id;
    pdf.text(student_id, 150, 170);

    pdf.text('Masters of Information Technology', 30, 210);
    pdf.text('Completion', 30, 230);
    pdf.text('30 November 2022', 150, 230);

    pdf.text('Year', 30, 270);
    pdf.text('Course Code', 80, 270);
    pdf.text('Course Title', 170, 270);
    pdf.text('Unit', 450, 270);
    pdf.text('Mark', 485, 270);
    pdf.text('Grade', 520, 270);

    pdf.setFontSize(12);

    let yAxis = 270;
    this.transcriptRecord.forEach((record, index) => {
      yAxis += 20;

      if (index === 0) {
        pdf.text(record.year, 30, yAxis);
      }

      if (index === 8) {
        yAxis += 20;
        pdf.text(record.year, 30, yAxis);
      }

      pdf.text(record.course_code, 80, yAxis);
      pdf.text(record.name, 170, yAxis);
      pdf.text("12", 450, yAxis);
      pdf.text(record.mark, 485, yAxis);
      pdf.text(this.getMark(parseInt(record.mark)), 520, yAxis);
    });

    pdf.text(`Cumulative GPA: ${this.getGPA()}`, 30, 640);
    pdf.setFontSize(10);

    pdf.text('End of Academic Record', 30, 700);
    pdf.save(`${name}_Transcripts.pdf`);

    this._snackBar.open("Successfully downloaded transcripts", null, {
      duration: 3000
    });
  }

  public downloadCertificate(): void {
    let jsPdfOptions: jsPDFOptions = {
      orientation: 'p',
      unit: 'pt',
      format: "a4"
    };
    const pdf = new jsPDF(jsPdfOptions);

    var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    var pageWidth = pdf.internal.pageSize.width || pdf.internal.pageSize.getWidth();

    var center = pageWidth / 2;

    var logo = new Image();
    logo.src = './assets/images/logo.png'
    pdf.addImage(logo, 'png', 210, 40, 150, 150)

    pdf.setFontSize(36);
    pdf.setFont('sans-serif');
    pdf.setTextColor('#000000');
    pdf.text('Royal Melbourne', center, 225, { align: 'center' });
    pdf.text('Institute of Technology', center, 265, { align: 'center' })

    pdf.setFontSize(14);
    pdf.text('This is to to certify that', center, 320, { align: 'center' })

    pdf.setFontSize(34);

    let name = "";
    if (this.userDetail.role === 'admin') {
      const studentTranscript = this.listOfUsers.find(user => user.student_id === this.transcriptRecordStudentId);
      name = `${studentTranscript.first_name} ${studentTranscript.family_name}`
    } else {
      name = `${this.userDetail.first_name} ${this.userDetail.family_name}`;
    }

    pdf.text(name, center, 370, { align: 'center' })

    pdf.setFontSize(14);
    pdf.text('was admitted to the degree of', center, 410, { align: 'center' })

    pdf.setFontSize(34);
    pdf.text('Masters of Information Technology', center, 460, { align: 'center' })

    pdf.setFontSize(14);
    pdf.text('on the thirtieth day of November in the year 2022', center, 500, { align: 'center' })
    pdf.text('having met all requirements for completion of this award', center, 520, { align: 'center' })

    var footer = new Image();
    footer.src = './assets/images/rmit.png'
    pdf.addImage(footer, 'png', 5, 550, 543, 272)

    pdf.save(`${name}_Certificate.pdf`);

    this._snackBar.open("Successfully downloaded certificate", null, {
      duration: 3000
    });
  }

  public getGPA(): string {
    const gpv = [
      { mark: 'HD', gpv: 4 },
      { mark: 'DI', gpv: 3 },
      { mark: 'CR', gpv: 2 },
      { mark: 'PA', gpv: 1 },
      { mark: 'NN', gpv: 0 },
    ]

    let total = 0;
    let totalUnits = 0;

    this.transcriptRecord?.forEach(record => {
      const creditPointxGradePointValue = parseInt(record.units) * (gpv.find(val => val.mark === this.getMark(parseInt(record.mark))).gpv);
      total += creditPointxGradePointValue;
      totalUnits += parseInt(record.units);
    });

    let gpa = (total / totalUnits).toFixed(2);
    return gpa;
  }

  public getMark(mark: number): string {
    let grade: string;
    if (mark >= 80) {
      grade = 'HD';
    }

    if (mark > 69 && mark < 80) {
      grade = 'DI';
    }

    if (mark > 59 && mark < 70) {
      grade = 'CR';
    }

    if (mark > 49 && mark < 59) {
      grade = 'PA';
    }

    if (mark < 50) {
      grade = 'NN';
    }

    return grade;
  }
}
