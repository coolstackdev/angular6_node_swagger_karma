import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';

@Component({
    selector: 'app-page-exams',
    templateUrl: './page.exams.pug',
    // styleUrls: ['./page.homework.css']
})

export class PageExams implements OnInit {
    students: any;
    homework: any = [];
    allQuizzes: any;
    usersDataHeader = [
        {header: 'table.updatedAt', property: 'updatedAt'},
        {header: 'table.quizTitle', property: 'title'},
        {header: 'table.school', property: 'schoolName'},
        {header: 'table.grade', property: 'gradeDescription'},
        {header: 'table.dueTo', property: 'dueTo'},
        {header: 'table.timeForQuiz', property: 'timeEstimate'},
        {header: 'table.actions', actions: ['create', 'copy', 'remove']}
    ];

    constructor(private apiService: ApiService,
                private translate: TranslateService,
                private dialogService: DialogService) {
    }

    ngOnInit() {
        this.getStudents();
        this.getExams();
        this.getAllQuizzes();
    }

    getStudents() {
        this.apiService.usersGET('role.student').then((data) => {
            this.students = data.users.map(user => {
                user.level = this.translate.instant(user.role.translation);
                user.role = user.role._id;
                user.fullName = user.name + ' ' + user.lastName;
                return user;
            });
        });
    }

    getExams() {
        this.apiService.examsGET().then((data) => {
            if (data.exams) {
                this.homework = data.exams.map((quiz) => {
                    quiz.title = quiz.quizzes.map(q => q.title).join(', ');
                    quiz.gradeDescription =  quiz.grade ? quiz.grade.category + ' (' + quiz.grade.level + ')' : '';
                    quiz.schoolName = quiz.school ? quiz.school.name : '';
                    // quiz.assignedTo = quiz.user ? quiz.user.name + ' ' + quiz.user.lastName : '';
                    // quiz.accessCode = quiz.accessCode.toUpperCase();
                    // quiz.completed = quiz.finished ? 'YES' : 'NO';
                    return quiz;
                });
            }
        });
    }

    getAllQuizzes() {
        this.apiService.quizzesManageGET().then((data) => {
            this.allQuizzes = data.quizzes;
        });
    }

    addExams(quizAnswer?) {
        if (quizAnswer) {
             quizAnswer.quizzes = quizAnswer.quizzes.map(quiz => quiz._id);
             quizAnswer.school = quizAnswer.school._id;
             quizAnswer.grade = quizAnswer.grade._id;
        }
        this.dialogService.dialogStudentAssignToQuiz(this.allQuizzes, [], true, quizAnswer).subscribe(() => {
            this.getExams();
        });
    }

    deleteExams(quizAnswer) {
        if (!quizAnswer.finished) {
            this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
                if (ok) {
                    this.apiService.quizAnswerDELETE([quizAnswer._id]).then((data) => {
                        if (data.success) {
                            this.getExams();
                        }
                    });
                }
            });
        }
    }

    viewQuizResult(quizAnswer) {
        if (quizAnswer.finished && quizAnswer.answers.length) {
            this.dialogService.dialogQuizResult(quizAnswer.answers);
        }
    }
}
