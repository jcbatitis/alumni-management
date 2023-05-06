import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranscriptService } from 'src/app/core/services/transcript.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss'],
})
export class VerificationComponent {
  public form: FormGroup;

  constructor(private transcriptService: TranscriptService) {
    this.form = new FormGroup({
      studentId: new FormControl('', [Validators.required]),
    });
  }

  public async verify(): Promise<void> {
    try {
      const transcript = await this.transcriptService
        .getTranscriptByStudentId(this.form.get('studentId').value)
        .toPromise();

      console.log(transcript);

      debugger;
    } catch (e) {}
  }
}
