import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {DialogService} from '../../../services/dialog.service';

@Component({
    selector: 'app-page-quiz-answers',
    templateUrl: './page.homework.pug',
    // styleUrls: ['./page.homework.css']
})

export class PageHomework implements OnInit {
    students: any;
    homework: any = [];
    allQuizzes: any;
    usersDataHeader = [
        {header: 'table.quizTitle', property: 'title'},
        // {header: 'table.assignedTo', property: 'assignedTo'},
        // {header: 'table.dueTo', property: 'dueTo'},
        // {header: 'table.timeForQuiz', property: 'timeEstimate'},
        // {header: 'table.accessCode', property: 'accessCode'},
        {header: 'table.assignedTo', property: 'assignedTo'},
        {header: 'table.questionsCorrect', property: 'questionsCorrect'},
        {header: 'table.duration', property: 'timeSpent'},
        {header: 'table.updatedAt', property: 'updatedAt'},
        {header: 'table.actions', actions: ['create', 'copy', 'remove']},
    ];

    constructor(
        private apiService: ApiService,
        private translate: TranslateService,
        private dialogService: DialogService,
    ) {
    }

    ngOnInit() {
        this.getStudents();
        this.getHometasks();
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

    getHometasks() {
        this.apiService.homeworkGET().then((data) => {
            if (data.quizzes) {
                this.homework = data.quizzes.map((quiz) => {
                    // TODO: If quiz deleted - quiz will be null
                    quiz.title = quiz.quiz ? quiz.quiz.title : '';
                    quiz.assignedTo = quiz.user ? quiz.user.name + ' ' + quiz.user.lastName : '';
                    quiz.questionsCorrect = this.getPercentage(quiz.questionsTotal, quiz.questionsCorrect);
                    // quiz.accessCode = quiz.accessCode.toUpperCase();
                    // quiz.completed = quiz.finished ? 'YES' : 'NO';
                    return quiz;
                });
            }
        });
    }

    getPercentage(total, num) {
        return Math.round(num / total * 100);
    }

    getAllQuizzes() {
        this.apiService.quizzesManageGET().then((data) => {
            this.allQuizzes = data.quizzes;
        });
    }

    addStudent(quizAnswer?) {
        if (!quizAnswer || !quizAnswer.finished) {
            if (quizAnswer) {
                quizAnswer.quiz = quizAnswer.quiz._id;
                quizAnswer.schools = quizAnswer.user.school;
                quizAnswer.user = quizAnswer.user._id;
            }
            this.dialogService.dialogStudentAssignToQuiz(this.allQuizzes, this.students, false, quizAnswer).subscribe(() => {
                this.getHometasks();
            });
        }
    }

    deleteQuizAnswer(quizAnswer) {
        if (!quizAnswer.finished) {
            this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
                if (ok) {
                    this.apiService.quizAnswerDELETE([quizAnswer._id]).then((data) => {
                        if (data.success) {
                            this.getHometasks();
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
