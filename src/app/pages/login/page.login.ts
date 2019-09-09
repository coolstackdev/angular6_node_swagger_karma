import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {ApiService} from '../../services/api.service';

@Component({
    selector: 'app-page-login',
    templateUrl: './page.login.pug',
    styleUrls: ['./page.login.scss']
})

export class PageLogin {
    errCode = {
        username: null,
        password: null
    };

    constructor(private apiService: ApiService, private router: Router) {
    }

    login(user) {
        this.apiService.login(user).then((data) => {
            if (data.success) {
                this.router.navigate(['/app']);
            } else {
                this.errCode = {
                    username: data.errorCode,
                    password: null
                };
            }
        });
    }

    loginSocial(user) {
        this.apiService.socialLogin(user);
        this.router.navigate(['/app']);
    }
}
