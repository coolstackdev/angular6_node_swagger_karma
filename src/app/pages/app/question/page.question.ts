import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {TranslateService} from '@ngx-translate/core';
import {DialogService} from '../../../services/dialog.service';
import {LocalStorageService} from 'ngx-webstorage';
import {FormBuilder, Validators} from '@angular/forms';

@Component({
    selector: 'app-question',
    templateUrl: './page.question.pug',
    styleUrls: ['./page.question.scss']
})

export class PageQuestion implements OnInit, OnDestroy {
    dialog: any;
    filter: any;
    subjects: any = [];
    dataHeaderSearch = [
        // {header: 'table.id', property: '_id'},
        {header: 'table.createdAt', property: 'createdAt'},
        {header: 'table.author', property: 'authorName'},
        {header: 'table.subject', property: 'subjectName'},
        {header: 'table.question', property: 'question'},
        {header: 'table.actions', actions: ['create']}
    ];
    dataSearch: any = [];
    dataSearchOriginal: any = [];
    dataHeaderKnown = [];
    dataKnown: any = [];
    dataHeaderResolved = [
        {header: 'table.updatedAt', property: 'updatedAt'},
        {header: 'table.author', property: 'authorName'},
        {header: 'table.subject', property: 'subjectName'},
        {header: 'table.question', property: 'question'},
        {header: 'table.actions', actions: ['review']}
    ];
    dataResolved: any = [];
    filtersGroup: any;

    constructor(private apiService: ApiService,
                private dialogService: DialogService,
                private translate: TranslateService,
                private storage: LocalStorageService,
                private formBuilder: FormBuilder) {
        this.translate.onLangChange.subscribe(() => {
            this.parseQuestions(this.dataSearch);
        });
    }

    ngOnInit() {
        this.getQuestions();

        this.filtersGroup = this.formBuilder.group({
            questionFilter: [],
        });
        // if (this.storage.retrieve('user').role.name !== 'admin' && this.storage.retrieve('user').subjects) {
        //     this.subjects = this.storage.retrieve('user').subjects;
        //     this.dataSearch.filter((item) => {
        //         if (this.subjects.indexOf(item.subject) !== 0) {
        //             return item;
        //         }
        //     });
        // }
        if (this.storage.retrieve('user').role.translation !== 'role.admin' && !this.storage.retrieve('user').subjects) {
            this.dataSearch = [];
        }

    }

    onTabChanged(e) {
        switch (e.index) {
            case 0:
                this.getQuestions();
                break;
            case 1:
                this.getResolvedQuestions();
                break;
        }
    }

    getQuestions(options = {resolved: false}) {
        this.apiService.questionManageGET(options).then(data => this.parseQuestions(data.questions));
    }

    parseQuestions(data) {
        this.dataSearch = data.map(question => {
            question.authorName = question.author ? question.author.name + ' ' + question.author.lastName : '';
            question.subjectName = question.subject ? question.subject.name[this.translate.currentLang] : '';
            return question;
        });
        this.dataSearchOriginal = [...this.dataSearch];
        if (this.filtersGroup.get('questionFilter').value) {
            this.changeFilter(this.filtersGroup.get('questionFilter').value);
        }
    }

    getResolvedQuestions() {
        this.apiService.questionManageGET({resolved: true}).then(data => this.parseResolvedQuestions(data.questions));
    }

    parseResolvedQuestions(data) {
        this.dataResolved = data.map(question => {
            question.authorName = question.author ? question.author.name + ' ' + question.author.lastName : '';
            question.subjectName = question.subject.name[this.translate.currentLang];
            return question;
        });
    }

    answerQuestion(e) {
        this.dialog = this.dialogService.dialogQuestion(e).subscribe(() => {
            this.getQuestions();
        });
    }

    answerReview(e) {
        this.dialog = this.dialogService.dialogQuestionReview(e).subscribe(() => {
            this.getResolvedQuestions();
            this.getAnsweredQuestions();
        });
    }

    changeFilter(filter): void {
        if (filter === 'new') {
            this.dataSearch = [...this.dataSearchOriginal].filter(e => !e.answers.length);
        } else if (filter === 'active') {
            this.dataSearch = [...this.dataSearchOriginal].filter(e => e.answers.length);
        } else {
            this.dataSearch = [...this.dataSearchOriginal];
        }
    }

    getNewQuestions(): void {
        this.apiService.questionManageGET({
            resolved: false,
            answered: false
        }).then(data => this.parseQuestions(data.questions));
    }

    getAnsweredQuestions(): void {
        this.apiService.questionManageGET({
            resolved: false,
            answered: true
        }).then(data => this.parseQuestions(data.questions));
    }

    ngOnDestroy() {
        if (this.dialog) {
            this.dialog.unsubscribe();
        }
    }
}
