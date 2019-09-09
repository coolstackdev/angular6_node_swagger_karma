import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-dialog-quiz-result',
    templateUrl: './dialog-quiz-result.component.pug'
})

export class DialogQuizResultComponent implements OnInit {
    selfClose: any;
    answers: any = [];
    correctAnswers = 0;

    constructor(private formBuilder: FormBuilder, private apiService: ApiService, public translate: TranslateService) {
    }

    ngOnInit() {
        this.answers.map((answer) => {
            if (answer.correct) {
                answer.correct = this.translate.instant('form.yes');
                this.correctAnswers++;
            } else {
                answer.correct = this.translate.instant('form.no');
            }
        });
    }
}
