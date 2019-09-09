import {Component, EventEmitter, Output, Input, OnInit} from '@angular/core';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';

@Component({
    selector: 'app-social-settings',
    templateUrl: './social-settings.component.pug'
})

export class SocialSettingsComponent implements OnInit {
    @Output() changeSocialSettings = new EventEmitter<{ name: string, text: string }>();
    @Input() val: string;
    @Input() key: string;
    form: FormGroup;

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            value: [this.val, [Validators.required]]
        });
    }

    submitForm() {
        if (this.form.valid) {
            this.changeSocialSettings.emit({name: this.key, text: this.form.value.value});
        }
    }
}
