import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-page-forgot-password',
    templateUrl: './page.forgot-password.pug',
    styleUrls: ['./page.forgot-password.scss']
})

export class PageForgotPassword implements OnInit, OnChanges {
    forgotPasswordForm: FormGroup;
    changePasswordForm: FormGroup;
    errCode: string;
    token: string;
    checkedUser: boolean;
    newPassword: boolean;

    constructor(
        private formBuilder: FormBuilder,
        private apiService: ApiService,
        private router: Router,
        private route: ActivatedRoute) {}

    ngOnInit() {
        this.forgotPasswordForm = this.formBuilder.group({
            username: ['', [Validators.required]]
        });

        this.changePasswordForm = this.formBuilder.group({
            password: ['', [Validators.required, Validators.minLength(5)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(5)]]
        }, {validator: this.matchingPasswords('password', 'confirmPassword')});

        this.route.queryParams.subscribe(queryParams => {
            this.token = queryParams['token'];
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.errCode.currentValue['username']) {
            this.forgotPasswordForm.controls.username.setErrors({'incorrect': true});
        }
    }

    checkUser() {
        if (this.forgotPasswordForm.valid) {
            this.apiService.forgotPassword(this.forgotPasswordForm.value.username).then((data) => {
                if (data.success) {
                    this.checkedUser = true;
                } else {
                    this.forgotPasswordForm.controls.username.setErrors({'incorrect': true});
                    this.errCode = data.errorCode;
                }
            });
        }
    }

    changePassword() {
        if (this.changePasswordForm.valid) {
            this.apiService.changePassword({
                token: this.token,
                pw: this.changePasswordForm.value.confirmPassword
            }).then((data) => {
                if (data.success) {
                    this.newPassword = true;
                } else {
                    this.changePasswordForm.controls.confirmPassword.setErrors({'invalid_token': true});
                    this.errCode = data.errorCode;
                }
            });
        }
    }

    private matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
        return (group: FormGroup) => {
            const password = group.controls[passwordKey];
            const confirmPassword = group.controls[confirmPasswordKey];
            if (password.value !== confirmPassword.value) {
                return {
                    mismatchedPasswords: true
                };
            }
        };
    }
}
