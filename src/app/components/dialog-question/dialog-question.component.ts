import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {TranslateService} from '@ngx-translate/core';

import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-dialog-question',
    templateUrl: './dialog-question.component.pug',
    styleUrls: ['./dialog-question.scss']
})

export class DialogQuestionComponent implements OnInit {
    selfClose: any;
    askForm: FormGroup;
    question: any;
    uploadUrl = environment.baseUrl + 'filereference';
    editOptions: any = {
        iframe: false,
        fontFamily: {
            'Roboto,sans-serif': 'Roboto',
            'Oswald,sans-serif': 'Oswald',
            'Montserrat,sans-serif': 'Montserrat',
            '\'Open Sans Condensed\',sans-serif': 'Open Sans Condensed'
        },
        fontFamilySelection: true,
        toolbarButtons: [
            'fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript',
            '|', 'wirisEditor', 'wirisChemistry',
            '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle',
            '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertLink', 'insertImage', 'insertVideo', 'insertAudio', 'embedly', 'insertFile', 'insertTable',
            '|', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', 'print', 'help', 'undo', 'redo'
        ],
        imageEditButtons: ['wirisEditor', 'wirisChemistry', 'imageDisplay', 'imageAlign', 'imageInfo', 'imageRemove'],
        htmlAllowedTags: ['.*'],
        htmlAllowedAttrs: ['.*'],
        requestHeaders: {
            'Authorization': this.apiService.getToken()
        },
        imageUploadURL: this.uploadUrl,
        videoUploadURL: this.uploadUrl,
        fileUploadURL: this.uploadUrl,
        audioUploadURL: this.uploadUrl
    };

    constructor(private formBuilder: FormBuilder, private apiService: ApiService, public translate: TranslateService) {
    }

    ngOnInit() {
        this.askForm = this.formBuilder.group({
            question: [this.question._id, [Validators.required]],
            message: ['', [Validators.required]],
            resolved: [false]
        });
        this.askForm.patchValue(this.question._id);
        this.askForm.patchValue(this.question.resolved);
    }

    getQuestion() {
        return this.apiService.questionGET(this.question._id);
    }

    submitForm() {
        this.apiService.questionManageUPDATE(this.askForm.value).then(data => {
            if (data.success) {
                console.log(data.data.question);
                this.question = data.data.question;
                this.askForm.reset();
                // this.ngOnInit();
                // console.log(this.question);
                // this.selfClose(data);
            }
        });
    }

    resolveQuestion() {
        this.askForm.value.resolved = true;
        this.askForm.value.message = 'Cette question a été marquée comme résolue';
        this.apiService.questionManageUPDATE(this.askForm.value).then(data => {
            if (data.success) {
                this.selfClose(data);
            }
        });
    }
}
