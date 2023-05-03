import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LoaderService {

    public loader$: Subject<boolean> = new Subject<boolean>();

    constructor() { }

    public setLoader(isLoading: boolean): void {
        this.loader$.next(isLoading);
    }

}
