import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {DialogService} from '../../../../services/dialog.service';

@Component({
    selector: 'app-page-admin-schools',
    templateUrl: './page.schools.pug',
    // styleUrls: ['./page.schools.scss']
})

export class PageAdminSchools implements OnInit {
    schools: any = [];
    schoolsDataHeader = [
        // {header: 'table.id', property: '_id'},
        {header: 'table.name', property: 'name'},
        {header: 'table.school-number', property: 'number'},
        {header: 'table.country', property: 'country'},
        {header: 'table.city', property: 'city'},
        {header: 'table.address', property: 'address'},
        {header: 'table.actions', actions: ['create', 'remove']}
    ];

    constructor(private apiService: ApiService, private dialogService: DialogService) {
    }

    ngOnInit() {
        this.getSchools();
    }

    getSchools() {
        this.apiService.schoolsGET().then((data) => {
            this.schools = data.schools;
        });
    }

    editSchool(school?) {
        this.dialogService.dialogSchoolSet(school).subscribe(() => {
            this.getSchools();
        });
    }

    deleteSchool(school?) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
            if (ok) {
                this.apiService.schoolDELETE([school._id]).then((data) => {
                    if (data.success) {
                        this.getSchools();
                    }
                });
            }
        });
    }
}
