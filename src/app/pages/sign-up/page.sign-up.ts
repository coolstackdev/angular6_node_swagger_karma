import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {ApiService} from '../../services/api.service';

@Component({
    selector: 'app-page-sign-up',
    templateUrl: './page.sign-up.pug',
    styleUrls: ['./page.sign-up.scss']
})

export class PageSignUp {
    errCode = {
        username: null,
        password: null
    };

    constructor(private api: ApiService, private router: Router) {
    }
}
