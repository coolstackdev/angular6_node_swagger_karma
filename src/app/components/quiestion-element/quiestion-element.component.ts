import {Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DialogService} from "../../services/dialog.service";
import {TranslateService} from "@ngx-translate/core";
import {map} from 'rxjs/internal/operators';
import {ApiService} from '../../services/api.service';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-question-element',
    templateUrl: './question-element.component.pug',
    styleUrls: ['./question-element.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class QuestionElementComponent implements OnInit {
    @Input() questions: any;
    @Input() index: any;
    @Input() question: FormGroup;
    uploadUrl = environment.baseUrl + 'filereference';
    questionOptions: any = {
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
    homeWorkVariants: any = [
        {name: this.translate.instant('form.variant.free'), variant: 'free'},
        {name: this.translate.instant('form.variant.options'), variant: 'options'},
        {name: this.translate.instant('form.variant.multiple'), variant: 'multiple'},
        {name: this.translate.instant('form.variant.boolean'), variant: 'boolean'},
        {name: this.translate.instant('form.variant.free-multiple'), variant: 'free-multiple'},
        {name: this.translate.instant('form.variant.match'), variant: 'match'}
    ];
    matchArray: any = [];

    constructor(private apiService: ApiService,
                private formBuilder: FormBuilder,
                private dialogService: DialogService,
                private translate: TranslateService,
                private cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        if (this.question.value.answer) {
            this.matchArray = this.question.value.answer;
        }
        this.cdr.detectChanges();
    }

    initOption() {
        console.log(this.matchArray);
        return this.formBuilder.group({
            _id: [],
            value: [, [Validators.required]],
            description: [],
            image: []
        });
    }

    removeFormElement(el, index) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((ok) => {
            if (ok) {
                el.removeAt(index);
            }
        });
    }

    matchChange(i, e) {
        this.question.patchValue({answer: this.matchArray});
    }

    uploadImg(e, element) {
        element.patchValue({'image': e.icon});
        element.patchValue({'value': e.icon});
    }
}
