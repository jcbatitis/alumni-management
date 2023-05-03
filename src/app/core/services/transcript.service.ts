import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Transcript } from '../models/transcript';

@Injectable({
    providedIn: 'root',
})
export class TranscriptService {
    constructor(private http: HttpClient) { }

    private baseURL: string = environment.baseURL;

    private transcriptDTO: Transcript;

    public transcriptsLoaded$: Subject<Transcript> = new Subject<Transcript>();

    public get userTranscript(): Transcript {
        return this.transcriptDTO;
    }

    public setTranscript(transcript: Transcript): void {
        this.transcriptDTO = transcript;
        this.transcriptsLoaded$.next(transcript);
    }

    public createTranscript(transcript: Transcript): Observable<any> {
        const token = localStorage.getItem('userAccessToken');

        if (!token) {
            return;
        }

        var options = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${token}`)
        }

        const url = `${this.baseURL}/Transcript/CreateTranscript`;
        return this.http.post(url, transcript, options);
    }

    public getTranscriptByStudentId(studentId: string): Observable<any> {
        const token = localStorage.getItem('userAccessToken');

        if (!token) {
            return;
        }

        var options = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${token}`)
        }

        const url = `${this.baseURL}/Transcript/GetTranscriptById/${studentId}`;
        return this.http.get(url, options);
    }
}
