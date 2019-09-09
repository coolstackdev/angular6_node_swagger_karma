import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {DialogService} from '../../../../services/dialog.service';

@Component({
    selector: 'app-page-admin-user-rank-list',
    templateUrl: './page.user-rank-list.pug',
})

export class PageAdminUserRankList implements OnInit {

    top: any = [];

    usersRangDataHeader = [
        {header: 'table.name', property: 'name'},
        {header: 'table.email', property: 'email'},
        {header: 'table.points', property: 'total'},
        {header: 'table.actions', actions: 'remove'}
    ];

    constructor(
        private apiService: ApiService,
        private dialogService: DialogService
    ) {}

    ngOnInit() {
        this.getTopUsers();
    }

    getTopUsers() {
        this.apiService.topGET().then((data) => {
            this.top = data.top.map(user => {
                const item = user[0]._id;
                user.name = item.name ? item.name : ' - ';
                // const userLastName = item.lastName ? item.lastName : ' - ';
                // user.fullName = userName + ' ' + userLastName;
                user.email = item.email ? item.email : ' - ';
                user.total =  user[0].total ? user[0].total : ' - ';
                return user;
            });
        });
    }

    deleteUser(user?) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
            if (ok) {
                this.apiService.usersDELETE([user._id]).then((data) => {
                    if (data.success) {
                        this.getTopUsers();
                    }
                });
            }
        });
    }
}
