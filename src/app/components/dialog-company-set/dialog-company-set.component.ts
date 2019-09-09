import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../environments/environment';
import {ApiService} from '../../services/api.service';

@Component({
    selector: 'app-dialog-company-set',
    templateUrl: './dialog-company-set.component.pug'
})

export class DialogCompanySetComponent implements OnInit {
    companyForm: FormGroup;
    selfClose: any;
    company: any;
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

    constructor(private formBuilder: FormBuilder, private apiService: ApiService) {
    }

    ngOnInit() {
        this.companyForm = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            icon: [, Validators.required],
        });
        if (this.company) {
            this.companyForm.patchValue(this.company);
        }
    }

    setIcon(data: { icon: string }): void {
        this.companyForm.patchValue({'icon': data.icon});
    }
}
