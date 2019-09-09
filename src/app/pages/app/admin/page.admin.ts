import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {LocalStorageService} from 'ngx-webstorage';

@Component({
    selector: 'app-page-admin',
    templateUrl: './page.admin.pug',
    styleUrls: ['./page.admin.scss']
})

export class PageAdmin implements OnInit {
    menu: any = [];

    constructor(private storage: LocalStorageService, private router: Router) {
    }

    ngOnInit() {
        this.menu = [
            {
                name: 'page.admin.userManagement.title',
                icon: 'supervised_user_circle',
                link: 'users'
            },
            {
                name: 'page.admin.userRankList.title',
                icon: 'trending_up',
                link: 'user-rank-list'
            },
            {
                name: 'page.admin.schoolManagement.title',
                icon: 'school',
                link: 'schools'
            }, {
                name: 'page.admin.gradeManagement.title',
                icon: 'grade',
                link: 'grade'
            }, {
                name: 'page.admin.subjectManagement.title',
                icon: 'book',
                link: 'subjects'
            }, {
                name: 'page.admin.subscriptions.title',
                icon: 'payment',
                link: 'subscriptions'
            }, {
                name: 'page.admin.offline-payments.title',
                icon: 'euro_symbol',
                link: 'offline-payments',
            }, {
                name: 'page.admin.orange-payments.title',
                icon: 'account_balance',
                link: 'orange-payments',
            }, {
                name: 'page.admin.paypal-payments.title',
                icon: 'local_parking',
                link: 'paypal-payments',
            }, {
                name: 'page.admin.settings.title',
                icon: 'settings',
                link: 'settings',
            }, {
                name: 'page.admin.notice-board.title',
                icon: 'add_alert',
                link: 'notice-board',
            },
            {
                name: 'page.admin.ideas-bugs.title',
                icon: 'lightbulb_on',
                link: 'ideas',
            }
        ];
    }
}
