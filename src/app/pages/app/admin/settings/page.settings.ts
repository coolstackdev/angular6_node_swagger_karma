import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-page-admin-settings',
    templateUrl: './page.settings.pug'
})

export class PageAdminSettings implements OnInit {
    public settings: { [key: string]: any; };
    referralCredits: FormGroup;

    constructor(private apiService: ApiService, private fb: FormBuilder) {
        this.settings = {};
        this.referralCredits = this.fb.group({
            type: ['value'],
            value: [0]
        })
    }

    ngOnInit() {
        this.apiService.settingsGET().then((data) => {
            data.data.settings.map(val => this.settings[val.name] = val);
            this.getReferral();
        });
    }

    getReferral() {
        let ref = this.settings.referralAmount;

        if (ref.percent) {
            this.referralCredits.setValue({
                type: 'percent',
                value: ref.percent
            })
        } else if (ref.value) {
            this.referralCredits.setValue({
                type: 'value',
                value: ref.value
            })
        }
    }

    setReferral() {
        let data = {
            _id: this.settings.referralAmount._id,
            name: 'referralAmount',
            value: this.referralCredits.get('type').value === 'value' ? this.referralCredits.get('value').value : 0,
            percent: this.referralCredits.get('type').value === 'percent' ? this.referralCredits.get('value').value : 0
        };
        this.submitForm(data);
    }

    submitForm(params: { [key: string]: any; }) {
        params._id = this.settings[params.name]._id;
        this.apiService.settingsSET(params).then((data) => this.settings[params.name] = data.data.settings);
    }
}
