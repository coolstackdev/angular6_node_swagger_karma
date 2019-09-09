import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';

import {ApiService} from '../../../../services/api.service';
import {DialogService} from '../../../../services/dialog.service';

@Component({
    selector: 'app-page-admin-subjects',
    templateUrl: './page.subjects.pug',
    // styleUrls: ['./page.subjects.scss']
})

export class PageAdminSubjects implements OnInit {
    isLoaded = false;
    subjects: any = [];
    primarySubjects: any = [];
    subjectsDataHeader = [
        {header: 'table.name', property: 'subjectName'},
        {header: 'table.description', property: 'description'},
        {header: 'table.costWeek', property: 'costWeek'},
        {header: 'table.costMonth', property: 'costMonth'},
        {header: 'table.costYear', property: 'costYear'},
        {header: 'table.actions', actions: ['create', 'remove']}
    ];
    primarySubjectsDataHeader = [
        {header: 'table.name', property: 'subjectName'},
        {header: 'table.subjects', property: 'innerSubjectsName'},
        {header: 'table.description', property: 'description'},
        {header: 'table.costWeek', property: 'costWeek'},
        {header: 'table.costMonth', property: 'costMonth'},
        {header: 'table.costYear', property: 'costYear'},
        {header: 'table.actions', actions: ['create', 'remove']}
    ];

    constructor(private apiService: ApiService, private translate: TranslateService, private dialogService: DialogService) {
        this.translate.onLangChange.subscribe(() => this.parseSubjects(this.subjects));
    }

    ngOnInit() {
        this.getSubjects();
    }

    parseSubjects(data) {
        let allSubjects = data.map(subject => {
            subject.subjectName = subject.name[this.translate.currentLang];
            subject.categoryName = subject.category ? subject.category.name : '';
            this.isLoaded = true;
            return subject;
        });
        this.subjects = allSubjects.filter(subject => !subject.isPrimary);
        this.primarySubjects = allSubjects.filter(subject => subject.isPrimary).map(subj => {
            subj.innerSubjectsName = subj.subjects.reduce((prev, curr) => {
                let str = prev;
                if (str.length) {
                    str += ', ';
                }
                str += curr.name[this.translate.currentLang];
                return str;
            }, '');
            subj.innerSubjectIDs = subj.subjects.map(item => item._id);
            return subj;
        });
    }

    onTabChanged(ev) {
    }

    getSubjects() {
        this.apiService.subjectsGET().then((data) => this.parseSubjects(data.subjects));
    }

    editSubject(subject?) {
        if (subject && subject.isPrimary) {
            subject.subjects = subject.innerSubjectIDs;
        }
        this.dialogService.dialogSubjectSet(subject, this.subjects).subscribe(() => {
            this.getSubjects();
        });
    }

    deleteSubject(subject?) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
            if (ok) {
                this.apiService.subjectDELETE([subject._id]).then((data) => {
                    if (data.success) {
                        this.getSubjects();
                    }
                });
            }
        });
    }
}
