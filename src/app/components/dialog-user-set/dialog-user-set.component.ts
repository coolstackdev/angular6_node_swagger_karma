import {Component, forwardRef, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {PasswordValidators} from '../../validators/password-validators';
import {CountryCodeService} from '../../services/country-code.service';

@Component({
    selector: 'app-dialog-user-set',
    templateUrl: './dialog-user-set.component.pug'
})

export class DialogUserSetComponent implements OnInit {
    selfClose: any;
    roles: any = [];
    schools: any = [];
    phone: any = [];
    user: any = [];
    userForm: any;
    referrals: any = [];
    subjects: any = [];
    codeCountry: any;
    schoolControl = new FormControl();
    filteredSchools: Observable<any[]>;
    referralControl = new FormControl();
    filteredReferrals: Observable<any[]>;

    constructor(private formBuilder: FormBuilder, private apiService: ApiService,
                private translate: TranslateService,  private countryCodeService: CountryCodeService) {
        this.translate.onLangChange.subscribe(() => this.parseSubjects(this.subjects));
        this.codeCountry = this.countryCodeService.getCodeCountry();
    }

    ngOnInit() {
        this.userForm = this.formBuilder.group({
            _id: [],
            username: [, [Validators.required]],
            name: [],
            lastName: [],
            email: [, [Validators.required]],
            role: [, [Validators.required]],
            subjects: [],
            school: [],
            referral: [],
            phone: [],
            countryCode: []
        }, {validator: PasswordValidators.passwordMatchValidator});
        this.schoolControl = this.userForm.controls.school;
        this.referralControl = this.userForm.controls.referral;
        this.apiService.subjectsGET().then((data) => this.parseSubjects(data.subjects));


        if (this.user) {
            this.userForm.patchValue(this.user);
            this.userForm.controls['username'].disable();
        }
        this.filteredSchools = this.schoolControl.valueChanges.pipe(startWith(''), map(value => this._filterSchool(value)));
        this.filteredReferrals = this.referralControl.valueChanges.pipe(startWith(''), map(value => this._filterReferral(value)));
    }


    isExists(val) {
        return typeof val !== 'undefined' && val !== 'undefined';
    }

    private parseSubjects(data) {
        this.subjects = data.map(subject => {
            subject.subjectName = subject.name[this.translate.currentLang];
            return subject;
        });
    }

    private _filterSchool(value: any): string[] {
        return this.schools.filter(school => {
            const name = value.name ? value.name : value;
            return school.name.toLowerCase().indexOf(name.toLowerCase()) === 0;
        });
    }

    private _filterReferral(value: any): string[] {
        return this.referrals.filter(referral => {
            const name = value.name ? value.name : value;
            return referral.name.toLowerCase().indexOf(name.toLowerCase()) === 0;
        });
    }

    displayFn(object, val) {
        let name = null;
        if (val) {
            const value = this[object].filter(el => el._id === val)[0];
            if (value) {
                if (object === 'schools' && this.isExists(value.number)) {
                    name = value.name + ' ' + value.number;
                } else {
                    name = value.name;
                }
            }
        }
        return name;
    }

    checkPasswords() {
        if (this.userForm.contains('password') && this.userForm.contains('confirmPassword')) {
            if (this.userForm.controls['password'].value === this.userForm.controls['confirmPassword'].value) {
                return null;
            } else {
                console.log('not match');
                this.userForm.get('confirmPassword').setErrors({noPassMatch: true});
                return {noPassMatch: true};
            }
        } else {
            return null;
        }
    }

    changePassword() {
        this.userForm.addControl('password', new FormControl(''));
        this.userForm.addControl('confirmPassword', new FormControl(''));
    }

    createUser() {
        // this.userForm.value.username ;
        this.userForm.controls['username'].enable();

        if (this.userForm.value.role === '5b6c24c36a4972074885c205') {
            this.userForm.value.referral = this.referrals.find(ref => ref._id === this.userForm.value.referral) &&
                this.referrals.find(ref => ref._id === this.userForm.value.referral).name || ' ';
        }
        return this.apiService.userProfilePUT(this.userForm.value).then((data) => {
            this.selfClose(data);
        });
    }
}
