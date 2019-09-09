import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ApiService} from '../../../services/api.service';
import {DialogService} from '../../../services/dialog.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-page-quizzes',
    templateUrl: './page.quizzes.pug',
    styleUrls: ['./page.quizzes.scss']
})

export class PageQuizzes implements OnInit {
    isFileLoading = false;
    quizzes: any = [];
    quizzesDataHeader = [
        // {header: 'table.id', property: '_id'},
        {header: 'table.title', property: 'title'},
        {header: 'table.lesson-subtitle', property: 'subtitle'},
        {header: 'table.subject', property: 'subjectName'},
        {header: 'table.grade', property: 'gradeDescription'},
        // {header: 'table.questions', property: 'questionsLength'},
        {header: 'table.actions', actions: ['create', 'remove']}
    ];
    @ViewChild('excelInput') excelInput: ElementRef;

    constructor(private apiService: ApiService, private dialogService: DialogService,
                private translate: TranslateService, private router: Router) {
        this.translate.onLangChange.subscribe(() => this.parseQuizzes(this.quizzes));
    }

    ngOnInit() {
        this.getQuizzes();
    }

    processFile(): void {
        const fileElem = this.excelInput.nativeElement;

        if (fileElem.files && fileElem.files[0]) {
            const formData = new FormData();
            formData.append('file', fileElem.files[0]);
            this.isFileLoading = true;
            this.apiService.fileExcelUpload(formData).then(
                (data) => {
                        this.isFileLoading = false;
                        this.dialogService.alert(data.data.status !== 'false' ? 'dialog.fileUpload.success' : 'dialog.fileUpload.failure');
                        this.getQuizzes();
                    // this.apiService.verifyQuizzes().then(res => {
                    //     console.log(res);
                    // });
                }
            );
        }
    }

    getFile(): void {
        this.excelInput.nativeElement.click();
    }

    getQuizzes() {
        this.apiService.quizzesManageGET().then((data) => {
            if (data.quizzes) {
                this.parseQuizzes(data.quizzes);
            }
        });
    }

    private parseQuizzes(data) {
        this.quizzes = data.map(quiz => {
            if (quiz.subject) {
                quiz.subjectName = quiz.subject.name[this.translate.currentLang];
            }
            if (quiz.grade) {
                quiz.gradeDescription = quiz.grade.category + ' (' + quiz.grade.level + ')';
            }
            if (quiz.grades.length === 0) {
                quiz.gradeDescription = quiz.grade.category + ' (' + quiz.grade.level + ')';
            } else {
                quiz.gradeDescription = quiz.grades.map(item => {
                    return item.category + ' (' + item.level + ') ';
            });
                console.log(quiz.gradeDescription, ' _');
            }
            // quiz.questionsLength = quiz.questions.length;
            return quiz;
        });
    }

    editQuiz(quiz?) {
        this.router.navigate(['/app/quiz/' + quiz._id]);
    }

    deleteQuiz(quiz?) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
            if (ok) {
                this.apiService.quizDELETE([quiz._id]).then((data) => {
                    if (data.success) {
                        this.getQuizzes();
                    }
                });
            }
        });
    }
}
