import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ApiService} from '../../services/api.service';

@Component({
    selector: 'app-offline-payment-activate',
    templateUrl: './dialog-offline-payment-activate.component.pug'
})

export class DialogOfflinePaymentActivateComponent implements OnInit {

    selfClose: any;
    subscriptions: any;
    paymentForm: any;
    payment: any = [];
    isSubscriptionFieldDisabled = false;
    isCashFlowFieldDisabled = false;
    paymentTypes = [
        {_id: -1, description: 'Canceled'},
        {_id: 0, description: 'On Hold'},
        {_id: 1, description: 'On Verification'},
        {_id: 2, description: 'Active'},
    ];

    constructor(private formBuilder: FormBuilder, private apiService: ApiService) {
    }

    ngOnInit() {
        this.paymentForm = this.formBuilder.group({
            _id: [, [Validators.required]],
            offlineCode: [],
            cashFlow: [],
            paymentStatus: [, [Validators.required]]
        });
        this.paymentForm.controls['offlineCode'].disable();

        if (this.payment) {
            this.paymentForm.patchValue(this.payment);
        }

        this.getSubscriptions();
        this.onChanges();
    }

    onChanges() {
        // this.paymentForm.get('subscription').valueChanges
        //     .subscribe(value => {
        //         this.isCashFlowFieldDisabled = value !== null;
        //     });
        // this.paymentForm.get('cashFlow').valueChanges
        //     .subscribe(value => {
        //         this.isSubscriptionFieldDisabled = value !== null;
        //     });
    }

    getSubscriptions() {
        this.apiService.subscriptionsGET().then((data) => {
            if (data.subscriptions) {
                this.subscriptions = data.subscriptions;
            }
        });
    }

    activatePayment() {
        return this.apiService.offlinePaymentActivatePUT(this.paymentForm.value).then((data) => {
            if (data.success) {
                this.selfClose(data);
            }
        });
    }

}
