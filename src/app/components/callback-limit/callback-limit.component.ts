import {Component, EventEmitter, Output, Input, OnInit} from '@angular/core';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';

@Component({
    selector: 'app-callback-limit',
    templateUrl: './callback-limit.component.pug'
})

export class CallbackLimitComponent implements OnInit {
    @Output() changeCallbackLimit = new EventEmitter<{ name: string, value: number }>();
    @Input() callbackLimit: number;
    form: FormGroup;

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            callbackLimit: [this.callbackLimit, [Validators.required]]
        });
    }

    submitForm() {
        if (this.form.valid) {
            this.changeCallbackLimit.emit({name: 'callbackLimit', value: this.form.value.callbackLimit});
        }
    }
}
