import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';

import {ApiService} from '../../../../services/api.service';
import {DialogService} from '../../../../services/dialog.service';

@Component({
    selector: 'app-page-admin-users',
    templateUrl: './page.users.pug',
    // styleUrls: ['./page.users.scss']
})

export class PageAdminUsers implements OnInit {
    roles: any = [];
    schools: any = [];
    referrals: any = [];
    users: any = [];
    usersDataHeader = [
        // {header: 'table.id', property: '_id'},
        {header: 'table.name', property: 'name', sortable: true},
        {header: 'table.level', property: 'level'},
        {header: 'table.email', property: 'email'},
        {header: 'table.username', property: 'username'},
        {header: 'table.phone', property: 'phone'},
        {header: 'table.points', property: 'points', sortable: true},
        {header: 'table.school', property: 'schoolName'},
        {header: 'table.grade', property: 'gradeDescription'},
        {header: 'table.createdAt', property: 'createdAt', sortable: true},
        {header: 'table.isDeleted', property: 'isDeleted'},
        {header: 'table.actions', actions: ['create', 'remove', 'set-cash']}
    ];

    constructor(
        private apiService: ApiService,
        private translate: TranslateService,
        private dialogService: DialogService
    ) {
    }

    ngOnInit() {
        this.getRolesAndSchools();
        this.getReferrals();
        this.getUsers();
    }

    getRolesAndSchools() {
        this.apiService.rolesGET().then((data) => {
            this.roles = data.roles;
        });
        this.apiService.schoolsGET().then((data) => {
            this.schools = data.schools;
        });
    }

    getReferrals() {
        this.apiService.referralsGET().then((data) => {
            this.referrals = data.referrals;
        });
    }

    getUsers() {
        this.apiService.usersGET('role.student,role.teacher').then((data) => {
            this.users = data.users.map(user => {
                // const userName = user.name ? user.name : ' - ';
                // const userLastName = user.lastName ? user.lastName : ' - ';
                user.gradeDescription = user.grade ? user.grade.category : ' ';
                user.level = this.translate.instant(user.role.translation);
                user.role = user.role._id;
                user.name = user.name ? user.name : ' - ';
                // user.fullName = userName + ' ' + userLastName;
                return user;
            });
            console.log(' users ', this.users);
        });
    }

    editUser(user?) {
        this.dialogService.dialogUserSet(this.roles, this.schools, this.referrals, user).subscribe(() => {
            this.getUsers();
            this.getReferrals();
        });
    }

    showUserCash(user?) {
        this.dialogService.userCash(user).subscribe(() => {
            this.getUsers();
        });
    }

    deleteUser(user?) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
            if (ok) {
                this.apiService.usersDELETE([user._id]).then((data) => {
                    if (data.success) {
                        this.getUsers();
                    }
                });
            }
        });
    }
}
