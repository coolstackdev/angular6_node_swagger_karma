import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {TranslateService} from '@ngx-translate/core';
import {DialogService} from '../../../../services/dialog.service';
import {StaticService} from "../../../../services/static-data.service";

@Component({
    selector: 'app-page-subscriptions',
    templateUrl: 'page.subscriptions.pug'
})

export class PageAdminSubscriptions implements OnInit {

    subscriptions: any = [];
    subjects: any = [];
    currencies: any = [];
    subscriptionsDataHeader = [
        {header: 'table.name', property: 'name'},
        {header: 'table.currency', property: 'currency'},
        {header: 'table.price', property: 'price'},
        {header: 'table.points', property: 'points'},
        {header: 'table.status', property: 'status'},
        {header: 'table.repeatable', property: 'repeatable'},
        {header: 'table.promoCode', property: 'promoCode'},
        {header: 'table.validTo', property: 'validTo'},
        {header: 'table.actions', actions: ['create', 'remove']}
    ];

    constructor(
        private apiService: ApiService,
        private translate: TranslateService,
        private dialogService: DialogService,
        private staticService: StaticService
    ) {
    }

    ngOnInit() {
        this.getSubscriptions();
        this.getCurrency();
    }

    getSubscriptions() {
        this.apiService.subscriptionsGET().then((data) => {
            this.subscriptions = data.subscriptions;
        });
    }

    getCurrency() {
        this.staticService.getCurrency().subscribe(data => {
            this.currencies = data;
        });
    }

    editSubscription(subscription?) {
        this.dialogService.dialogSubscriptionSet(subscription, this.currencies).subscribe(() => {
            this.getSubscriptions();
        });
    }

    deleteSubscription(subscription?) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
            if (ok) {
                this.apiService.subscriptionDELETE([subscription._id]).then((data) => {
                    if (data.success) {
                        this.getSubscriptions();
                    }
                });
            }
        });
    }

}
