import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-dialog-question',
    templateUrl: './dialog-question-reviewed.component.pug'
})

export class DialogQuestionReviewedComponent implements OnInit {
    selfClose: any;
    question: any;
    message: any;

    constructor(private apiService: ApiService, public translate: TranslateService) {}

    ngOnInit() {
    }

    unresolveQuestion() {
        this.apiService.questionManageUPDATE({question: this.question['_id'], message: 'Cette question a été réouverte', resolved: false}).then(data => {
            if (data.success) {
                this.selfClose(data);
            }
        });
    }
}
