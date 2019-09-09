import {Component, forwardRef, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {StaticService} from '../../services/static-data.service';
import {ApiService} from '../../services/api.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-dialog-school-set',
    templateUrl: './dialog-school-set.component.pug'
})

export class DialogSchoolSetComponent implements OnInit {
    selfClose: any;
    school: any = [];
    schoolForm: any;
    countries: any = [];
    cityControl = new FormControl();

    constructor(private formBuilder: FormBuilder, private staticService: StaticService, private apiService: ApiService,
                private translate: TranslateService) {
    }

    ngOnInit() {
        this.schoolForm = this.formBuilder.group({
            _id: [],
            name: [],
            number: [],
            country: [],
            city: [, Validators.pattern('[a-zA-Z ]*')],
            address: [],
            contactName: [],
            contactPosition: [],
            contactPhone: [],
            contactEmail: []
        });
        this.cityControl = this.schoolForm.controls.city;
        this.staticService.getCountries().subscribe(data => {
            this.countries = data;
        });
        if (this.school) {
            this.schoolForm.patchValue(this.school);
        }
    }

    getCityErrorMessage() {
        return this.schoolForm.controls.city.hasError('required') ? this.translate.instant('errors.required') : this.schoolForm.controls.city.hasError('pattern') ? this.translate.instant('errors.cityPattern') : '';
    }

    submitForm() {
        this.apiService.schoolSET(this.schoolForm.value).then(data => {
            if (data.success) {
                this.selfClose(data);
            }
        });
    }
}
