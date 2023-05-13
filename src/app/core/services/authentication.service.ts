
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { IAuthUserDTO } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    constructor(private http: HttpClient,
        private cookieService: CookieService) { }

    private apiKey: string = environment.apiKey;
    private baseURL: string = environment.baseURL;
    private authSignupURL: string = environment.authSignupURL;
    private authSigninURL: string = environment.authSigninURL;

    public checkIfValidSession(): Observable<any> {
        const token = this.cookieService.get('userAccessToken');

        if (!token) {
            return;
        }

        var options = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${token}`)
        }

        const url = `${this.baseURL}/User/CheckUserSession`;
        return this.http.post(url, null, options)
    }

    public signUp(authUser: IAuthUserDTO): Observable<any> {
        const url = `${this.authSignupURL}?key=${this.apiKey}`;
        return this.http.post(url, authUser);
    }

    public signIn(authUser: IAuthUserDTO): Observable<any> {
        const url = `${this.authSigninURL}?key=${this.apiKey}`;
        return this.http.post(url, authUser);
    }
}
