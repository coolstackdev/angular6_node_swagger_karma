import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {StaticService} from '../../services/static-data.service';

@Component({
    selector: 'app-dialog-subscription-set',
    templateUrl: './dialog-subscription-set.component.pug'
})

export class DialogSubscriptionSetComponent implements OnInit {
    selfClose: any;
    subscriptionForm: any;
    subscription: any = [];
    currencies: any = [];
    currencyControl = new FormControl();
    filteredCurrency: Observable<any[]>;

    constructor(
        private formBuilder: FormBuilder,
        private apiService: ApiService,
        private translate: TranslateService,
        private staticService: StaticService
    ) {
    }

    ngOnInit() {
        this.subscriptionForm = this.formBuilder.group({
            _id: [],
            name: [, Validators.required],
            promoCode: [],
            currency: [, Validators.required],
            price: [, [Validators.required]],
            points: [, [Validators.required]],
            validTo: [],
            repeatable: [],
            status: []
        });
        if (this.subscription) {
            this.subscriptionForm.patchValue(this.subscription);
        }
        // this.getCurrency();
        this.currencyControl = this.subscriptionForm.controls.currency;
        this.filteredCurrency = this.currencyControl.valueChanges.pipe(startWith(''), map(value => this._filterCurrency(value)));
    }

    private _filterCurrency(value: any): string[] {
        const filterValue = value.toLowerCase();
        return filterValue ? this.currencies.filter(option => option.name.toLowerCase().includes(filterValue)) : this.currencies;
    }

    displayFn(object, val) {
        let name = null;
        if (val) {
            console.log(this[object]);
            const value = this[object].filter(el => el.code === val)[0];
            if (value) {
                name = value.name;
            }
        }
        return name;
    }

    createSubscription() {
        return this.apiService.subscriptionSET(this.subscriptionForm.value).then((data) => {
            if (data.success) {
                this.selfClose(data);
            }
        });
    }
}
