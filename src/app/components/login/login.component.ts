import {Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges, OnDestroy} from '@angular/core';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';
import {AuthService} from 'ng2-ui-auth';

export class User {
    constructor(public username: string, public password: string) {
    }
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.pug',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit, OnChanges, OnDestroy {
    @Output() loggedIn = new EventEmitter<User>();
    @Output() loginSocial = new EventEmitter<User>();
    @Input() errCode: object;
    form: FormGroup;
    isVisible = false;
    socialLoginService: any;

    constructor(private formBuilder: FormBuilder, private auth: AuthService) {
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(5)]]
        });
        this.form.valueChanges.subscribe(changes => {
            const hasError = (field, error) => this.form.get(field).hasError(error);
            if (hasError('username', 'incorrect')) {
                this.form.get('username').setErrors(null);
            }
            if (hasError('password', 'incorrect')) {
                this.form.get('password').setErrors(null);
            }
        });
    }

    login() {
        if (this.form.valid) {
            this.loggedIn.emit(
                new User(
                    this.form.value.username,
                    this.form.value.password
                )
            );
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.errCode.currentValue['username']) {
            this.form.controls.username.setErrors({'incorrect': true});
            this.form.controls.password.setErrors({'incorrect': true});
        }
    }

    loginValidationErr(field) {
        return this.form.controls[field].hasError('required') ? 'required' : this.form.controls[field].hasError('incorrect') ?  this.errCode[field] : '';
    }

    makePasswordVisible() {
        this.isVisible = !this.isVisible;
    }

    socialLogin(name) {
        this.socialLoginService = this.auth.authenticate(name).subscribe(data => {
            this.loginSocial.emit(data.data);
        });
    }

    ngOnDestroy() {
        if (this.socialLoginService) {
            this.socialLoginService.unsubscribe();
        }
    }
}
