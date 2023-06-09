import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Transcript } from '../models/transcript';
import { Certificate } from '../models/certificate';
import { UserDocument } from '../models/document';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private http: HttpClient,
    private cookieService: CookieService) {}

  private baseURL: string = environment.baseURL;

  private documentDTO: UserDocument;

  public documentLoaded$: BehaviorSubject<UserDocument> =
    new BehaviorSubject<UserDocument>(null);

  public get userDocuments(): UserDocument {
    return this.documentDTO;
  }

  public setUserDocument(document: UserDocument): void {
    this.documentDTO = document;
    this.documentLoaded$.next(document);
  }

  public createTranscript(transcript: Transcript): Observable<any> {
    const token = this.cookieService.get('userAccessToken');

    if (!token) {
      return;
    }

    var options = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    };

    const url = `${this.baseURL}/Document/CreateTranscript`;
    return this.http.post(url, transcript, options);
  }

  public getTranscriptByStudentId(studentId: string): Observable<any> {
    const url = `${this.baseURL}/Document/GetTranscriptById/${studentId}`;
    return this.http.get(url);
  }

  public createCertificate(certificate: Certificate): Observable<any> {
    const token = this.cookieService.get('userAccessToken');

    if (!token) {
      return;
    }

    var options = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    };

    const url = `${this.baseURL}/Document/CreateCertificate`;
    return this.http.post(url, certificate, options);
  }

  public getCertificateById(id: string): Observable<any> {
    const url = `${this.baseURL}/Document/GetCertificateById/${id}`;
    return this.http.get(url);
  }

  public getCertificateByStudentId(studentId: string): Observable<any> {
    const url = `${this.baseURL}/Document/GetCertificateByStudentId/${studentId}`;
    return this.http.get(url);
  }
}
