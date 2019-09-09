import {Injectable} from '@angular/core';

import {Resolve} from '@angular/router';

import {ApiService} from '../services/api.service';

@Injectable()
export class QuizzesResolver implements Resolve<any> {
    constructor(private apiService: ApiService) {
    }

    resolve() {
        // return this.apiService.quizAnswerGET().then((data) => {
        //     if (data.quizanswers) {
        //         return data.quizanswers;
        //     }
        // });
    }
}

