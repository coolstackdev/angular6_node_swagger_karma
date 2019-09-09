import {Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.pug',
    styleUrls: ['./sign-up.component.scss']
})

export class SignUpComponent implements OnInit {
    form: FormGroup;

    constructor(private formBuilder: FormBuilder) {
    }

    rolesList = [{value: 1, name: 'page.signUp.role1'}, {value: 2, name: 'page.signUp.role2'}];
    levelsList = [{value: 1, name: 'page.signUp.level1'}, {value: 2, name: 'page.signUp.level2'}, {value: 3, name: 'page.signUp.level3'}];

    ngOnInit() {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(5)]],
            role: ['', [Validators.required]],
            level: ['', [Validators.required]]
        });
    }

    register() {
        return true;
    }
}
