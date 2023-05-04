import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IUserDTO } from 'src/app/core/models/user';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UserService {

    private baseURL: string = environment.baseURL;

    private userDTO: IUserDTO;

    private users: IUserDTO[];

    public userDetailsLoaded$: Subject<IUserDTO> = new Subject<IUserDTO>();
    
    public allUsersLoaded$: Subject<IUserDTO[]> = new Subject<IUserDTO[]>();

    constructor(private http: HttpClient) { }

    public get userList(): IUserDTO[] {
        return this.users;
    }

    public get userDetail(): IUserDTO {
        return this.userDTO;
    }

    public setUsers(users: IUserDTO[]): void {
        this.users = users;
        this.allUsersLoaded$.next(users);
    }

    public setUserDetails(userDetail: IUserDTO): void {
        this.userDTO = userDetail;
        this.userDetailsLoaded$.next(userDetail);
    }

    public getUsers(): Observable<IUserDTO[]> {
        const token = localStorage.getItem('userAccessToken');

        if (!token) {
            return;
        }

        var options = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${token}`)
        }

        const url = `${this.baseURL}/User/GetAllUsers`;
        return this.http.get<IUserDTO[]>(url, options);
    }

    public getUserByEmail(email: string): Observable<IUserDTO> {
        const token = localStorage.getItem('userAccessToken');

        if (!token) {
            return;
        }

        var options = {
            headers: new HttpHeaders()
                .set('Authorization', `Bearer ${token}`)
        }

        const url = `${this.baseURL}/User/GetUserByEmail/${email}`;
        return this.http.get<IUserDTO>(url, options);
    }
}