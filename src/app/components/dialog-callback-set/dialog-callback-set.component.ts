import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-dialog-callback-set',
    templateUrl: './dialog-callback-set.component.pug'
})

export class DialogCallbackSetComponent implements OnInit {
    selfClose: any;
    callback: any = [];
    callbackForm: any;
    statuses: string[] = ['Uncalled', 'Called', 'Unavailable (retry later)'];

    constructor(private formBuilder: FormBuilder, private apiService: ApiService, private translate: TranslateService) {
    }

    ngOnInit() {
        this.callbackForm = this.formBuilder.group({
            _id: [, Validators.required],
            status: [, Validators.required],
            userFullName: [],
            userPhone: [],
            user: [, Validators.required],
            subject: [, Validators.required],
            reason: [, Validators.required],
            calldate: [, Validators.required],
            calltime: [, Validators.required]
        });
        if (this.callback) {
            console.log(this.callback);
            this.callbackForm.patchValue(this.callback);
            this.callbackForm.controls['userFullName'].disable();
            this.callbackForm.controls['userPhone'].disable();
            this.callbackForm.controls['calldate'].setValue(`${new Date(this.callback.calldate).toLocaleDateString()} ${this.callback.calltime}`);
            this.callbackForm.controls['calldate'].disable();
        }
    }

    submitForm() {
        this.callbackForm.value.calldate = this.callback.calldate;
        this.apiService.callbackSET({
            _id: this.callbackForm.value._id,
            status: this.callbackForm.value.status,
            subject: this.callback.subject._id
        }).then(data => {
            if (data.success) {
                this.selfClose(data);
            }
        });
    }
}
