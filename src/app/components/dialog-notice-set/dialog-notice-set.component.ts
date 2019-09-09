import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {environment} from '../../../environments/environment';
import {ApiService} from '../../services/api.service';

@Component({
    selector: 'app-dialog-notice-set',
    templateUrl: './dialog-notice-set.component.pug'
})

export class DialogNoticeSetComponent implements OnInit {
    uploadUrl = environment.baseUrl + 'filereference';
    noticeForm: FormGroup;
    selfClose: any;
    noticeTypes = [
        {_id: 0, description: 'News'},
        {_id: 1, description: 'Warnings'},
    ];
    notice: any;
    type: any;
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

    constructor(private formBuilder: FormBuilder, private apiService: ApiService) {
    }

    ngOnInit() {
        this.noticeForm = this.formBuilder.group({
            type: [, Validators.required],
            title: [, Validators.required],
            message: [, Validators.required]
        });
        if (this.notice) {
            this.noticeForm.addControl('_id', new FormControl());
            this.noticeForm.patchValue(this.notice);

            this.type = this.noticeTypes.find(type => type.description === this.notice.type);
            this.noticeForm.controls['type'].setValue(this.type._id);
        }
    }
}
