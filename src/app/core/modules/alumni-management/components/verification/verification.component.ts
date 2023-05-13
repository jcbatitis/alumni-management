import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DocumentService } from 'src/app/core/services/document.service';
import { UserService } from '../../services/user.service';
import jsPDF, { jsPDFOptions } from 'jspdf';
import { IUserDTO } from 'src/app/core/models/user';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderService } from 'src/app/core/services/loader.service';
import { Certificate } from 'src/app/core/models/certificate';
import { mergeMap, tap } from 'rxjs/operators';
import {
  ERROR_SNACKBAR_OPTION,
  SUCCESS_SNACKBAR_OPTION,
} from 'src/app/core/models/snackbar';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss'],
})
export class VerificationComponent {
  public form: FormGroup;
  public userDetail: IUserDTO;
  public studentCertificateUrl: string;
  public studentId: string;
  public certificateId: string;

  constructor(
    private transcriptService: DocumentService,
    private userService: UserService,
    private _snackBar: MatSnackBar,
    private loaderService: LoaderService,
    private documentService: DocumentService
  ) {
    this.form = new FormGroup({
      certificateId: new FormControl('', [Validators.required]),
    });
  }

  public async verify(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this._snackBar.open(
        'Please fill in the required details',
        null,
        ERROR_SNACKBAR_OPTION
      );

      return;
    }

    this.loaderService.setLoader(true);
    this.documentService
      .getCertificateById(this.form.get('certificateId').value)
      .pipe(
        tap((details: Certificate) => {
          this.studentId = details.student_id;
          this.certificateId = details.certificate_id;
        }),
        mergeMap(() => this.userService.getUserById(this.studentId))
      )
      .subscribe(
        (user: IUserDTO) => {
          this.userDetail = user;
          this.viewCertificate();
        },
        (error) => {
          this._snackBar.open(
            'Invalid Certificate ID',
            null,
            ERROR_SNACKBAR_OPTION
          );
          console.log(error);
        }
      )
      .add(() => {
        this.loaderService.setLoader(false);
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

    pdf.setFontSize(12);
    pdf.text(this.certificateId, 510, 825);

    var footer = new Image();
    footer.src = './assets/images/rmit.png';
    pdf.addImage(footer, 'png', 5, 525, 543, 272);

    const fileName = `${this.userDetail.first_name}_${this.userDetail.family_name}_${this.certificateId}.pdf`;
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
}
