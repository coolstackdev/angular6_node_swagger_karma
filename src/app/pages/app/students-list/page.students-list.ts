import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';

@Component({
    selector: 'app-page-students-list',
    templateUrl: './page.students-list.pug',
    styleUrls: ['./page.students-list.scss']
})

export class PageStudentsList implements OnInit {
    displayedColumns: string[] = ['position', 'username', 'create', 'remove'];
    dataStudents: any;

    constructor(private apiService: ApiService) {
    }

    ngOnInit() {
        this.apiService.usersGET('student').then((data) => {
            this.dataStudents = data.users;
        });
    }
}
