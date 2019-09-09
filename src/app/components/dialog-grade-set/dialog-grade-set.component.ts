import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-dialog-grade-set',
    templateUrl: './dialog-grade-set.component.pug'
})

export class DialogGradeSetComponent implements OnInit {
    selfClose: any;
    grade: any = [];
    gradeForm: any;

    constructor(private formBuilder: FormBuilder, private apiService: ApiService, private translate: TranslateService) {
    }

    ngOnInit() {
        this.gradeForm = this.formBuilder.group({
            _id: [],
            min: [],
            max: [],
            category: [],
            level: [],
            translation: []
        });
        if (this.grade) {
            this.gradeForm.patchValue(this.grade);
        }
    }

    // checkAgeRange() {
    //     if (this.gradeForm.controls.max.value != null && this.gradeForm.controls.min.value != null) {
    //         if (this.gradeForm.controls.min.value > this.gradeForm.controls.max.value) {
    //             this.minMoreThanMaxError = true;
    //             console.log(this.minMoreThanMaxError);
    //
    //         } else if (this.gradeForm.controls.min.value === this.gradeForm.controls.max.value) {
    //             this.minMaxEqualsError = true;
    //         }
    //     } else {
    //         this.minMoreThanMaxError = false;
    //         this.minMaxEqualsError = false;
    //     }
    // }

    // getErrorMessageMin() {
    //     console.log('min', this.gradeForm.controls.min);
    //     return this.gradeForm.controls.min.hasError('required') ? this.translate.instant('errors.required') :
    //         this.gradeForm.controls.min.hasError('min') ? 'Not a valid email' :
    //             '';
    // }
    //
    // getErrorMessageMax() {
    //     console.log('max', this.gradeForm.controls.max);
    //     return this.gradeForm.controls.max.hasError('required') ? this.translate.instant('errors.required') :
    //         this.gradeForm.controls.max.hasError('min') ? 'Not a valid email' :
    //             '';
    // }

    submitForm() {
        this.apiService.gradeSET(this.gradeForm.value).then(data => {
            if (data.success) {
                this.selfClose(data);
            }
        });
    }
}
