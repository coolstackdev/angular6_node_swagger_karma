import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {FormBuilder, Validators} from '@angular/forms';
import {DialogService} from '../../../services/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalStorageService} from 'ngx-webstorage';

@Component({
    selector: 'app-page-quiz-set',
    templateUrl: './page.quiz-set.pug',
})

export class PageQuizSet implements OnInit, OnDestroy {
    pageLoading = false;
    routeParams: any;
    quizForm: any;
    subjects: any;
    grades: any;
    quiz: any;
    numberOfQuestions: number;
    user: any;

    constructor(private apiService: ApiService, private formBuilder: FormBuilder, private dialogService: DialogService,
                private translate: TranslateService, private router: Router, private route: ActivatedRoute,
                private storage: LocalStorageService) {
        this.translate.onLangChange.subscribe(() => this.parseSubjects(this.subjects));
    }

    public ngOnInit(): void {
        this.user = this.storage.retrieve('user');
        this.storage.observe('user').subscribe((user) => {
            this.user = user || {};
        });
        this.quizForm = this.formBuilder.group({
            _id: [],
            title: [, [Validators.required]],
            subtitle: [, [Validators.required]],
            subject: [, [Validators.required]],
            grade: [, [Validators.required]],
            grades: [, [Validators.required]],
            questions: this.formBuilder.array([]),
            points: [, Validators.required]
        });
        this.getSubjects();
        this.getGrades();
        this.routeParams = this.route.params.subscribe(params => {
            if (params.id) {
                this.pageLoading = true;
                this.apiService.quizGET(params.id).then(data => {
                    if (data.quiz) {
                        data.quiz.questions.map((question, q1) => {
                            const questions = this.quizForm.controls.questions;
                            questions.push(this.initQuestion());
                            question.options.map(() => {
                                const option = questions.controls[q1].controls.options;
                                option.push(this.initOption());
                            });
                        });
                        this.quizForm.patchValue(data.quiz);
                        this.pageLoading = false;
                    }
                });
            }
        });
    }
    getForm() {
        console.log(this.quizForm);
    }

    parseSubjects(data) {
        this.subjects = data.map(subject => {
            subject.subjectName = subject.name[this.translate.currentLang];
            return subject;
        });
        if (!this.quizForm.controls['subject'].value && this.user.subjects && this.user.subjects.length) {
            this.quizForm.controls['subject'].setValue(this.user.subjects[0]);
        }
    }

    getSubjects() {
        this.apiService.subjectsGET().then((data) => this.parseSubjects(data.subjects));
    }

    getGrades() {
        this.apiService.gradesGET().then((data) => {
            this.grades = data.grades;
        });
    }

    initQuestion() {
        return this.formBuilder.group({
            _id: [],
            title: [, [Validators.required]],
            variant: [, [Validators.required]],
            options: this.formBuilder.array([]),
            answer: [],
            answerDescription: []
        });
    }

    setNumberOfQuestions() {
        for (let i = 0; i < (this.numberOfQuestions || 1); i++) {
            this.quizForm.controls.questions.push(this.initQuestion());
        }
        this.numberOfQuestions = null;
    }

    initOption() {
        return this.formBuilder.group({
            _id: [],
            value: [, [Validators.required]],
            description: [''],
            image: [],
        });
    }

    submitForm() {
        this.apiService.quizSET(this.quizForm.value).then(data => {
            if (data.success) {
                this.cancelForm();
            }
        });
    }

    cancelForm() {
        this.router.navigate(['/app/quizzes']);
    }

    ngOnDestroy() {
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}
