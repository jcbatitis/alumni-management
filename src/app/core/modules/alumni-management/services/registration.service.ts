import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuthUserDTO, IUserDTO } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  constructor(private http: HttpClient) { }

  private baseURL: string = environment.baseURL;

  public addUser(user: IUserDTO): Observable<any> {
    const url = `${this.baseURL}/User/CreateUser/`;
    return this.http.post(url, user);
  }
}
