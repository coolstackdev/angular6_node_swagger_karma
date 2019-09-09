import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {DialogService} from '../../../../services/dialog.service';


@Component({
    selector: 'app-page-admin-grade',
    templateUrl: './page.grade.pug',
})

export class PageAdminGrade implements OnInit {
    grades: any = [];
    gradesDataHeader = [
        // {header: 'table.id', property: '_id'},
        {header: 'table.category', property: 'category'},
        {header: 'table.level', property: 'level'},
        {header: 'table.actions', actions: ['create', 'remove']}
    ];

    constructor(private apiService: ApiService, private dialogService: DialogService) {
    }

    ngOnInit() {
        this.getGrades();
    }

    getGrades() {
        this.apiService.gradesGET().then((data) => {
            this.grades = data.grades;
        });
    }

    editGrade(grade?) {
        this.dialogService.dialogGradeSet(grade).subscribe(() => {
            this.getGrades();
        });
    }

    deleteGrade(grade?) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
            if (ok) {
                this.apiService.gradeDELETE([grade._id]).then((data) => {
                    if (data.success) {
                        this.getGrades();
                    }
                });
            }
        });
    }
}
