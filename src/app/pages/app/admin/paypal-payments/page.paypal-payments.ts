import {Component} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {DialogService} from '../../../../services/dialog.service';

@Component({
    selector: 'app-page-paypal-payments',
    templateUrl: './page.paypal-payments.pug'
})

export class PageAdminPayPalPayments {
    activePayments = [];
    nonActivePayments = [];
    PayPalPaymentsDataHeader = [
        {header: 'table.cashFlow', property: 'cashFlow'},
        {header: 'table.username', property: 'username'},
        {header: 'table.userPhone', property: 'userPhone'},
        {header: 'table.updatedAt', property: 'updatedAt'},
    ];
    paymentType = {
        '-1': {description: 'Canceled'},
        '0': {description: 'On Hold'},
        '1': {description: 'On Verification'},
        '2': {description: 'Active'}
    };

    constructor(private apiService: ApiService) {
        this.getPayPalPayments();
    }

    getPayPalPayments() {
        this.apiService.paypalPaymentsGET().then(data => {
            console.log('!! ', data);
            data.payments.map(balance => {
                balance.userPhone = balance.user.phone;
                balance.username = balance.user.username;
                balance.paymentStatusDescription = this.paymentType[balance.paymentStatus].description;
            });
            this.activePayments = data.payments;
            console.log(this.activePayments);
        });
    }
}
