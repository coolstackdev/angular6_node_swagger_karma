import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {DialogService} from '../../services/dialog.service';
import {MatDialog, MatDialogRef} from '@angular/material';
import {DialogAlertComponent} from '../dialog-alert/dialog-alert.component';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-dialog-student-assign-to-quiz',
    templateUrl: './dialog-student-assign-to-quiz.component.pug',
    styleUrls: ['./dialog-student-assign-to-quiz.scss']
})

export class DialogStudentAssignToQuizComponent implements OnInit {
    isExams: boolean;
    grades: any = [];
    selfClose: any;
    students: any = [];
    schools: any = [];
    quizzes: any = [];
    quizAnswer: any;
    quizIds: any = [];
    school: any = null;
    phone: string;
    studentForm: any;
    studentControl = new FormControl();
    filteredStudents: Observable<string[]>;

    constructor(private formBuilder: FormBuilder, private apiService: ApiService,
                private dialog: MatDialog,
                private translate: TranslateService) {
    }

    ngOnInit() {
        if (this.isExams) {
            this.studentForm = this.formBuilder.group({
                quizzes: [, Validators.required],
                school: [],
                timeEstimate: [, Validators.required],
                dueTo: [, Validators.required],
                grade: [[], [Validators.required]]
            });
        } else {
            this.studentForm = this.formBuilder.group({
                quiz: [, Validators.required],
                schools: [],
                user: [, Validators.required],
                timeEstimate: [, Validators.required],
                dueTo: [, Validators.required]
            });
        }

        this.studentControl = this.studentForm.controls.user;

        if (this.quizAnswer) {
            this.studentForm.patchValue(this.quizAnswer);
        }
        if (this.studentControl) {
            this.filteredStudents = this.studentControl.valueChanges
                .pipe(
                    startWith(''),
                    map(value => this._filterStudent(value))
                );
        }

        this.getSchools();
        this.getGrades();
    }

    alert(message: string): Observable<boolean> {

        let dialogRef: MatDialogRef<DialogAlertComponent>;

        dialogRef = this.dialog.open(DialogAlertComponent);
        dialogRef.componentInstance.message = this.translate.instant(message);

        return dialogRef.afterClosed();
    }

    getGrades() {
        this.apiService.gradesGET().then((data) => {
            this.grades = data.grades || [];
        });
    }

    getSchools() {
        this.apiService.schoolsGET().then((data) => {
            this.schools = data.schools;
        });
    }

    private _filterStudent(value: string): string[] {
        const filterValue = value.toLowerCase();
        const toLowerCase = (str) => str.toLowerCase();
        return this.students.filter(student => {
            return toLowerCase(student.fullName).includes(filterValue) ||
                toLowerCase(student.username).includes(filterValue) ||
                toLowerCase(student.email).includes(filterValue);
        });
    }

    private _filterStudentByOtherFields(value: string, gradeIds: any, schoolId: any): string[] {
        if (gradeIds.length && schoolId) {
            return this.students.filter(student => {
                return student.school === schoolId && gradeIds.includes(student.grade);
            });
        } else if (gradeIds.length) {
            return this.students.filter(student => gradeIds.includes(student.grade));
        } else {
            return this.students.filter(student => student.school === schoolId);
        }
    }

    displayFn(object, val) {
        let name = null;
        if (val) {
            const value = this[object].filter(el => el._id === val)[0];
            if (value) {
                name = value.fullName;
            }
        }
        return name;
    }

    submitForm() {
        let options = this.studentForm.value;
        if (this.quizAnswer) {
            options['_id'] = this.quizAnswer['_id'];
        }
        if (!this.isExams) {
            delete options['schools'];
        }
        this.apiService[this.isExams ? 'examSET' : 'quizAnswerSET'](options).then(data => {
            if (data.success) {
                this.selfClose(data);
            } else {
                this.alert(data.message);
            }
        });
    }

    changeFilter(quiz: any, school: any): void {
        if (quiz && this.isExams) {
            const quizIndex = this.quizIds.findIndex(gradeId => {
                return quiz._id === gradeId.split('-')[0] && quiz.grade._id === gradeId.split('-')[1];
            });
            if (this.quizIds.length !== 0) {
                if (quizIndex > -1) {
                    this.quizIds.splice(quizIndex, 1);
                } else {
                    this.quizIds.push(`${quiz._id}-${quiz.grade._id}`);
                }
            } else {
                this.quizIds.push(`${quiz._id}-${quiz.grade._id}`);
            }
        } else {
            this.quizIds = (quiz) ? [`${quiz._id}-${quiz.grade._id}`] : this.quizIds;
        }

        const gradeIds = this.quizIds.reduce((ids, current, index, array) => {
            if (ids.indexOf(current.split('-')[1]) === -1) {
                ids.push(current.split('-')[1]);
            }
            return ids;
        }, []);
        this.school = school && school._id || this.school && this.school || null;
        if (this.studentControl) {
            this.filteredStudents = this.studentControl.valueChanges
                .pipe(
                    startWith(''),
                    map(value => this._filterStudentByOtherFields(value, gradeIds, this.school))
                );
        }
    }
}
