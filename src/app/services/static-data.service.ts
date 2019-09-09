import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';


@Injectable()
export class StaticService {
    constructor(private http: HttpClient) {

    }

    public getCountries(): Observable<any> {
        return this.http.get('./assets/json/countries.json').pipe(map((res: any) => res));
    }

    public getCurrency(): Observable<any> {
        return this.http.get('./assets/json/currency.json').pipe(map((res: any) => res));
    }
}
