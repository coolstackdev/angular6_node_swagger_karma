import {Component, forwardRef, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {IconsModel} from '../../models/icons.model';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
    selector: 'app-dialog-subject-set',
    templateUrl: './dialog-subject-set.component.pug'
})

export class DialogSubjectSetComponent implements OnInit {
    selfClose: any;
    grades: any;
    roles: any = [];
    schools: any = [];
    subject: any = [];
    subjects: any = [];
    subjectForm: any;
    iconsObject: any = [];
    iconsSubjectsNames: any = [];
    iconsNames: any = [];
    filteredIcons: Observable<string[]>;
    iconsControl = new FormControl();

    constructor(private formBuilder: FormBuilder, private apiService: ApiService) {
    }

    ngOnInit() {
        this.getGrades();
        this.iconsSubjectsNames = IconsModel.getSubjectsNames();
        this.iconsNames = IconsModel.getSubjectIconsNames();
        for (let i = 0; i < this.iconsNames.length; i++) {
            this.iconsObject.push({name: this.iconsNames[i], subject: this.iconsSubjectsNames[i]});
        }
        this.subjectForm = this.formBuilder.group({
            _id: [],
            name: this.formBuilder.group({
                en: [, Validators.required],
                fr: [, Validators.required]
            }),
            accessByGrade: [, Validators.required],
            isPrimary: [false],
            icon: [, Validators.required],
            description: [, Validators.required],
            costWeek: [, Validators.required],
            costMonth: [, Validators.required],
            costYear: [, Validators.required],
            callbackCost: [, Validators.required],
            questionCost: [, Validators.required]
        });
        this.subjectForm.get('isPrimary').valueChanges.subscribe(val => {
            val ? this.subjectForm.addControl('subjects', new FormControl([], Validators.required))
                : this.subjectForm.removeControl('subjects');
        });
        this.iconsControl = this.subjectForm.controls.icon;
        if (this.subject) {
            if (this.subject.isPrimary) {
                this.subjectForm.addControl('subjects', new FormControl([], Validators.required));
            }
            this.subjectForm.patchValue(this.subject);
        }
        this.filteredIcons = this.iconsControl.valueChanges.pipe(startWith(''), map(value => this._filterIcon(value)));
    }

    getGrades() {
        this.apiService.gradesGET().then((data) => {
            this.grades = data.grades;
        });
    }

    private _filterIcon(value: string): string[] {
        const filterValue = value.toLowerCase();
        return filterValue ? this.iconsObject.filter(option => option.name.toLowerCase().includes(filterValue)) : this.iconsObject;
    }

    submitForm(): void {
        this.apiService.subjectSET(this.subjectForm.value).then((data) => this.selfClose(data));
    }

    setIcon(data: { icon: string }): void {
        this.subjectForm.patchValue({'icon': data.icon});
    }
}
