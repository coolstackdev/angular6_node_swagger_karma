import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class CountryCodeService {

    private codeCountry = [
        {   name: '+220',
            value: '+220'
        },
        {
            name: '+221',
            value: '+221'
        },
        {   name: '+222',
            value: '+222'
        },
        {
            name: '+223',
            value: '+223'
        },
        {
            name: '+224',
            value: '+224'
        },
        {   name: '+225',
            value: '+225'
        },
        {
            name: '+226',
            value: '+226'
        },
        {
            name: '+227',
            value: '+227'
        },
        {
            name: '+228',
            value: '+228'
        },
        {
            name: '+229',
            value: '+229'
        }
    ];

    getCodeCountry() {
        return this.codeCountry;
    }
}
