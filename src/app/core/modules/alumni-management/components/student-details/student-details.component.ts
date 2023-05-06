import { Component, OnInit, SecurityContext } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Grade } from 'src/app/core/models/transcript';
import { UserService } from '../../services/user.service';
import { IUserDTO } from 'src/app/core/models/user';
import { TranscriptService } from 'src/app/core/services/transcript.service';
import jsPDF, { jsPDFOptions } from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.scss'],
})
export class StudentDetailsComponent implements OnInit {
  constructor(
    private userService: UserService,
    private transcriptService: TranscriptService,
    private _snackBar: MatSnackBar,
    private _sanitizer: DomSanitizer
  ) {}

  public transcriptSource: MatTableDataSource<Grade>;
  public transcriptRecord: Grade[];
  public displayedColumns: string[] = [
    'year',
    'course_code',
    'name',
    'units',
    'mark',
    'grade',
  ];

  public studentCertificateUrl: string;

  public userDetail: IUserDTO;

  ngOnInit(): void {
    this.userService.userDetailsLoaded$.subscribe((isLoaded) => {
      if (isLoaded) {
        this.userDetail = this.userService.userDetail;
        this.viewCertificate();
      }
    });

    this.transcriptService.transcriptsLoaded$.subscribe((isLoaded) => {
      if (isLoaded) {
        this.transcriptRecord = this.transcriptService.userTranscript.grades;
        this.transcriptSource = new MatTableDataSource(this.transcriptRecord);
      }
    });
  }

  public applyTranscriptFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.transcriptSource.filter = filterValue.trim().toLowerCase();
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

    this.transcriptRecord?.forEach((record) => {
      const creditPointxGradePointValue =
        parseInt(record.units) *
        gpv.find((val) => val.mark === this.getMark(parseInt(record.mark))).gpv;
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
    name = `${this.userDetail.first_name} ${this.userDetail.family_name}`;

    pdf.text(name, 30, 150);
    pdf.text('Student Number', 30, 170);

    const student_id = this.userDetail.student_id;
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
      pdf.text('12', 450, yAxis);
      pdf.text(record.mark, 485, yAxis);
      pdf.text(this.getMark(parseInt(record.mark)), 520, yAxis);
    });

    pdf.text(`Cumulative GPA: ${this.getGPA()}`, 30, 640);
    pdf.setFontSize(10);

    pdf.text('End of Academic Record', 30, 700);
    pdf.save(`${name}_Transcripts.pdf`);

    this._snackBar.open('Successfully downloaded transcripts', null, {
      duration: 3000,
    });
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
    name = `${this.userDetail.first_name} ${this.userDetail.family_name}`;

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

    var footer = new Image();
    footer.src = './assets/images/rmit.png';
    pdf.addImage(footer, 'png', 5, 550, 543, 272);

    const fileName = `${name}_Certificate.pdf`;

    pdf.setProperties({
      title: fileName,
    });

    this.studentCertificateUrl = pdf.output('datauristring');

    if (download) {
      pdf.save(fileName);
      this._snackBar.open('Successfully downloaded certificate', null, {
        duration: 3000,
      });
    }
  }
}
