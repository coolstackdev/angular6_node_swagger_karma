import {Component} from '@angular/core';
import {ApiService} from '../../../../services/api.service';

@Component({
    selector: 'app-page-orange-payments',
    templateUrl: './page.orange-payments.pug'
})

export class PageAdminOrangePayments {
    activePayments = [];
    nonActivePayments = [];
    OrangePaymentsDataHeader = [
        {header: 'table.cashFlow', property: 'cashFlow'},
        {header: 'table.userPhone', property: 'userPhone'},
        {header: 'table.email', property: 'email'},
        // {header: 'table.statusCallback', property: 'paymentStatus'},
        {header: 'table.updatedAt', property: 'updatedAt'}
    ];

    paymentType = {
        '-1': {description: 'Canceled'},
        '0': {description: 'On Hold'},
        '1': {description: 'On Verification'},
        '2': {description: 'Active'}
    };

    constructor(private apiService: ApiService) {
        this.getOrangePayments();
    }

    getOrangePayments() {
        this.apiService.orangePaymentsGET().then(data => {
            data.payments.map(balance => {
                balance.userPhone = (balance.user.countryCode || '') + ' ' + balance.user.phone;
                balance.email = balance.user.email;
                balance.paymentStatus = this.paymentType[balance.paymentStatus].description;
            });
            this.activePayments = data.payments;
        });
    }
}
