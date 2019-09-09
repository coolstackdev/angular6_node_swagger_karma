import {Component} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {DialogService} from '../../../../services/dialog.service';

@Component({
    selector: 'app-page-offline-payments',
    templateUrl: './page.offline-payments.pug'
})

export class PageAdminOfflinePayments {

    activePayments = [];
    nonActivePayments = [];
    companies = [];
    activeOfflinePaymentsDataHeader = [
        {header: 'table.offlineCode', property: 'offlineCode'},
        {header: 'table.company', property: 'offlineCompany'},
        {header: 'table.cashFlow', property: 'cashFlow'},
        // {header: 'table.status', property: 'status'},
        {header: 'table.username', property: 'username'},
        {header: 'table.userPhone', property: 'userPhone'},
        {header: 'table.updatedAt', property: 'updatedAt'},
        {header: 'table.activatedByUser', property: 'activatedByUser'},
    ];
    nonActiveOfflinePaymentsDataHeader = [
        {header: 'table.offlineCode', property: 'offlineCode'},
        {header: 'table.company', property: 'offlineCompany'},
        {header: 'table.type', property: 'paymentStatusDescription'},
        {header: 'table.username', property: 'username'},
        {header: 'table.userPhone', property: 'userPhone'},
        {header: 'table.file', property: 'file'},
        {header: 'table.createdAt', property: 'createdAt'},
        {header: 'table.actions', actions: ['create']}
    ];
    companiesHeader = [
        {header: 'table.icon', property: 'icon'},
        {header: 'table.name', property: 'name'},
        {header: 'table.notice', property: 'description'},
        {header: 'table.actions', actions: ['create', 'remove']}
    ];
    paymentType = {
        '-1': {description: 'Canceled'},
        '0': {description: 'On Hold'},
        '1': {description: 'On Verification'},
        '2': {description: 'Active'}
    };

    constructor(private apiService: ApiService,
                private dialogService: DialogService) {
        this.getNonActiveOfflinePayments();
        this.getCompanies();
    }

    getNonActiveOfflinePayments() {
        this.apiService.offlinePaymentsGET(false).then(data => {
            data.balances.map(balance => {
                balance.userPhone = balance.user && balance.user.phone || '-';
                balance.username = balance.user && balance.user.username || '-';
                balance.offlineCompany = balance.offlineCompany && balance.offlineCompany.name || '-';
                balance.paymentStatusDescription = this.paymentType[balance.paymentStatus].description;
            });
            this.nonActivePayments = data.balances;
        });
    }

    getActiveOfflinePayments() {
        this.apiService.offlinePaymentsGET(true).then(data => {
            data.balances.map(balance => {
                balance.userPhone = balance.user && balance.user.phone || '-';
                balance.username = balance.user && balance.user.username || '-';
                balance.paymentStatusDescription = this.paymentType[balance.paymentStatus].description;
                balance.activatedByUser = balance.hasOwnProperty('activatedBy') ? balance.activatedBy.username : '';
            });
            this.activePayments = data.balances;
            console.log(this.activePayments);
        });
    }

    getCompanies() {
        this.apiService.companiesGET().then((data) => this.companies = data.data.companies);
    }

    onTabChanged(e) {
        switch (e.index) {
            case 0:
                this.getNonActiveOfflinePayments();
                break;
            case 1:
                this.getActiveOfflinePayments();
                break;
        }
    }

    activatePayment(payment) {
        this.dialogService.dialogOfflinePaymentActivate(payment).subscribe(() => {
            this.getNonActiveOfflinePayments();
        });
    }

    createCompany(company?) {
        this.dialogService.dialogCompanySet(company).subscribe(
            (data) => {
                if (data) {
                    if (company) {
                        data['_id'] = company._id;
                    }
                    this.apiService.companySET(data).then((res) => this.getCompanies());
                }
            }
        );
    }

    deleteCompany(ev) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
            if (ok) {
                this.apiService.companiesDELETE(ev._id).then(data => {
                    this.getCompanies();
                });
            }
        });
    }
}
