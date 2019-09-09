import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../services/api.service';
import {AbstractControl, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {DialogService} from '../../../services/dialog.service';
import {TranslateService} from '@ngx-translate/core';

import {environment} from '../../../../environments/environment';

@Component({
    selector: 'app-page-lesson-set',
    templateUrl: './page.lesson-set.pug',
    // styleUrls: ['./page.lesson-set.scss']
})

export class PageLessonSet implements OnInit, OnDestroy {
    pageLoading = false;
    routeParams: any;
    subjects: any;
    grades: any;
    lessonForm: any;
    uploadUrl = environment.baseUrl + 'filereference';
    editOptions: any = {
        iframe: false,
        fontFamily: {
            'Roboto,sans-serif': 'Roboto',
            'Oswald,sans-serif': 'Oswald',
            'Montserrat,sans-serif': 'Montserrat',
            'Open Sans Condensed,sans-serif': 'Open Sans Condensed'
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

    constructor(private apiService: ApiService, private formBuilder: FormBuilder, private dialogService: DialogService,
                private translate: TranslateService, private router: Router, private route: ActivatedRoute) {
        this.translate.onLangChange.subscribe(() => this.parseSubjects(this.subjects));
    }

    public ngOnInit(): void {
        this.lessonForm = this.formBuilder.group({
            _id: [],
            title: [, [Validators.required]],
            subtitle: [, [Validators.required]],
            subject: [, [Validators.required]],
            grade: [, [Validators.required]],
            sections: this.formBuilder.array([])
        });
        this.getSubjects();
        this.getGrades();
        this.routeParams = this.route.params.subscribe(params => {
            if (params.id) {
                this.pageLoading = true;
                this.apiService.lessonGET(params.id).then(data => {
                    if (data.lesson) {
                        data.lesson.sections.map((section, sI) => {
                            const sections = this.lessonForm.controls.sections;
                            sections.push(this.initContent());
                            section.homework.map((home, hI) => {
                                const homework = sections.controls[sI].controls.homework;
                                homework.push(this.initQuestion());
                                home.options.map(() => {
                                    homework.controls[hI].controls.options.push(this.initOption());
                                });
                            });
                        });
                        this.lessonForm.patchValue(data.lesson);
                        this.pageLoading = false;
                    }
                });
            }
        });
    }

    initContent() {
        return this.formBuilder.group({
            _id: [],
            title: [, [Validators.required]],
            subtitle: [],
            content: [],
            homework: this.formBuilder.array([]),
            expanded: [false]
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

    initOption() {
        return this.formBuilder.group({
            _id: [],
            value: [, [Validators.required]],
        });
    }

    parseSubjects(data) {
        this.subjects = data.map(subject => {
            subject.subjectName = subject.name[this.translate.currentLang];
            return subject;
        });
    }

    getSubjects() {
        this.apiService.subjectsGET().then((data) => this.parseSubjects(data.subjects));
    }

    getGrades() {
        this.apiService.gradesGET().then((data) => {
            this.grades = data.grades;
        });
    }

    removeFormElement(el, index) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.dataLost').subscribe((status) => {
            if (status) {
                el.removeAt(index);
            }
        });
    }

    submitForm() {
        // console.log(this.lessonForm);
        this.apiService.lessonSET(this.lessonForm.value).then(data => {
            if (data.success) {
                this.router.navigate(['/app/lessons']);
            }
        });
    }

    ngOnDestroy() {
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}
