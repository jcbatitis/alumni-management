import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { IUserDTO } from 'src/app/core/models/user';
import { UserService } from '../../services/user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DocumentService } from 'src/app/core/services/document.service';
import jsPDF, { jsPDFOptions } from 'jspdf';
import { Grade, Transcript } from 'src/app/core/models/transcript';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SUCCESS_SNACKBAR_OPTION } from 'src/app/core/models/snackbar';
import { Certificate } from 'src/app/core/models/certificate';
import { UserDocument } from 'src/app/core/models/document';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  constructor(
    private userService: UserService,
    private loaderService: LoaderService,
    private documentService: DocumentService,
    private _snackBar: MatSnackBar
  ) {}

  public studentsSource: MatTableDataSource<IUserDTO>;
  public transcriptSource: MatTableDataSource<Grade>;

  public userColumns: string[] = [
    'student_id',
    'first_name',
    'middle_name',
    'family_name',
    'email',
    'select',
  ];

  public displayedColumns: string[] = [
    'year',
    'course_code',
    'name',
    'units',
    'mark',
    'grade',
  ];

  public listOfUsers: IUserDTO[];
  public userDetail: IUserDTO;
  public tabIndex: number = 1;
  public transcripts: Transcript;
  private transcriptRecordStudentId: string;
  public transcriptGrades: Grade[];

  public studentDetail: IUserDTO;
  public studentCertificateUrl: string;
  public userDocument: UserDocument;

  public get studentFullName(): string {
    if (!this.studentDetail) {
      return;
    }

    let name = '';

    name = `${this.studentDetail.first_name}`;

    if (this.studentDetail.middle_name) {
      name += ` ${this.studentDetail.middle_name}`;
    }

    name += ` ${this.studentDetail.family_name}`;

    return name;
  }

  ngOnInit(): void {
    this.userService.allUsersLoaded$.subscribe((isLoaded) => {
      if (isLoaded) {
        this.listOfUsers = this.userService.userList.filter(
          (user) => user.role === 'student'
        );
        this.studentsSource = new MatTableDataSource(this.listOfUsers);
      }
    });

    this.userService.userDetailsLoaded$.subscribe((isLoaded) => {
      if (isLoaded) {
        this.userDetail = this.userService.userDetail;
      }
    });
  }

  public applyStudentFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.studentsSource.filter = filterValue.trim().toLowerCase();
  }

  public applyTranscriptFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.transcriptSource.filter = filterValue.trim().toLowerCase();
  }

  public getUserDocuments(student: IUserDTO): void {
    this.loaderService.setLoader(true);

    const requests = [];
    requests.push(this.documentService.getTranscriptByStudentId(student.id));
    requests.push(this.documentService.getCertificateByStudentId(student.id));

    forkJoin(requests).subscribe((documents) => {
      const transcripts = documents[0] as Transcript;
      const certificate = documents[1] as Certificate;

      const userDocument: UserDocument = {
        transcripts,
        certificate,
      };

      this.userDocument = userDocument;
      this.transcriptGrades = this.userDocument.transcripts.grades;
      this.transcriptSource = new MatTableDataSource(this.transcriptGrades);

      this.transcriptRecordStudentId = this.userDocument.transcripts.student_id;

      this.studentDetail = this.listOfUsers.find(
        (student) => student.id === this.transcriptRecordStudentId
      );

      this.viewCertificate();

      this.tabChange();
      this.loaderService.setLoader(false);
    });
  }

  public tabChange(): void {
    this.tabIndex = 2;
  }

  public downloadTranscript(): void {
    let jsPdfOptions: jsPDFOptions = {
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    };
    const pdf = new jsPDF(jsPdfOptions);

    var pageHeight =
      pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    var pageWidth =
      pdf.internal.pageSize.width || pdf.internal.pageSize.getWidth();

    pdf.setTextColor('#000000');
    pdf.setFont('sans-serif');

    var rmitLogo = new Image();
    rmitLogo.src = './assets/images/rmit-logo.png';
    pdf.addImage(rmitLogo, 'png', 25, 40, 150, 60);

    pdf.setFontSize(14);
    pdf.text('ACADEMIC TRANSCRIPT', 390, 60);

    let name = '';

    const studentTranscript = this.listOfUsers.find(
      (user) => user.id === this.transcriptRecordStudentId
    );

    name = `${studentTranscript.first_name}`;

    if (studentTranscript.middle_name) {
      name += ` ${studentTranscript.middle_name}`;
    }

    name += ` ${studentTranscript.family_name}`;

    pdf.text(name, 30, 150);
    pdf.text('Student Number', 30, 170);

    const student_id = this.transcriptRecordStudentId;
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
    this.transcriptGrades.forEach((record, index) => {
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
      pdf.text('12', 450, yAxis);
      pdf.text(record.mark, 485, yAxis);
      pdf.text(this.getMark(parseInt(record.mark)), 520, yAxis);
    });

    pdf.text(`Cumulative GPA: ${this.getGPA()}`, 30, 640);
    pdf.setFontSize(10);

    pdf.text('End of Academic Record', 30, 700);

    const fileName = `${name}_Transcripts.pdf`;

    pdf.setProperties({
      title: fileName,
    });

    pdf.save(fileName);

    this._snackBar.open(
      'Successfully downloaded transcripts',
      null,
      SUCCESS_SNACKBAR_OPTION
    );
  }

  public getGPA(): string {
    const gpv = [
      { mark: 'HD', gpv: 4 },
      { mark: 'DI', gpv: 3 },
      { mark: 'CR', gpv: 2 },
      { mark: 'PA', gpv: 1 },
      { mark: 'NN', gpv: 0 },
    ];

    let total = 0;
    let totalUnits = 0;

    this.transcriptGrades?.forEach((record) => {
      const creditPointxGradePointValue =
        parseInt(record.units) *
        gpv.find((val) => val.mark === this.getMark(parseInt(record.mark))).gpv;
      total += creditPointxGradePointValue;
      totalUnits += parseInt(record.units);
    });

    let gpa = (total / totalUnits).toFixed(2);
    return gpa;
  }

  public viewCertificate(download: boolean = false): void {
    let jsPdfOptions: jsPDFOptions = {
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    };
    const pdf = new jsPDF(jsPdfOptions);

    var pageHeight =
      pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
    var pageWidth =
      pdf.internal.pageSize.width || pdf.internal.pageSize.getWidth();

    var center = pageWidth / 2;

    var logo = new Image();
    logo.src = './assets/images/logo.png';
    pdf.addImage(logo, 'png', 210, 40, 150, 150);

    pdf.setFontSize(36);
    pdf.setFont('sans-serif');
    pdf.setTextColor('#000000');
    pdf.text('Royal Melbourne', center, 225, { align: 'center' });
    pdf.text('Institute of Technology', center, 265, { align: 'center' });

    pdf.setFontSize(14);
    pdf.text('This is to to certify that', center, 320, { align: 'center' });

    pdf.setFontSize(34);

    let name = '';
    const studentTranscript = this.listOfUsers.find(
      (user) => user.id === this.transcriptRecordStudentId
    );

    name = `${studentTranscript.first_name}`;

    if (studentTranscript.middle_name) {
      name += ` ${studentTranscript.middle_name}`;
    }

    name += ` ${studentTranscript.family_name}`;

    pdf.text(name, center, 370, { align: 'center' });

    pdf.setFontSize(14);
    pdf.text('was admitted to the degree of', center, 410, { align: 'center' });

    pdf.setFontSize(34);
    pdf.text('Masters of Information Technology', center, 460, {
      align: 'center',
    });

    pdf.setFontSize(14);
    pdf.text('on the thirtieth day of November in the year 2022', center, 500, {
      align: 'center',
    });
    pdf.text(
      'having met all requirements for completion of this award',
      center,
      520,
      { align: 'center' }
    );

    pdf.setFontSize(12);
    pdf.text(this.userDocument.certificate.certificate_id, 510, 825);

    var footer = new Image();
    footer.src = './assets/images/rmit.png';
    pdf.addImage(footer, 'png', 5, 525, 543, 272);

    const fileName = `${name}_${this.userDocument.certificate.certificate_id}.pdf`;

    pdf.setProperties({
      title: fileName,
    });

    this.studentCertificateUrl = pdf.output('datauristring');

    if (download) {
      pdf.save(fileName);
      this._snackBar.open(
        'Successfully downloaded certificate',
        null,
        SUCCESS_SNACKBAR_OPTION
      );
    }
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
