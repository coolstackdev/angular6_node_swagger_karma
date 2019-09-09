import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {DialogService} from '../../../services/dialog.service';
import {TranslateService} from '@ngx-translate/core';


@Component({
    selector: 'app-page-admin-callbacks',
    templateUrl: './page.callbacks.pug',
})

export class PageCallbacks implements OnInit {
    callbacks: any = [];
    callbacksDataHeader = [
        {header: 'table.name', property: 'userFullName'},
        {header: 'table.phone', property: 'userPhone'},
        {header: 'table.createdAt', property: 'createdAt'},
        {header: 'table.callDate', property: {calldate: 'calldate', calltime: 'calltime'}},
        {header: 'table.statusCallback', property: 'status'},
        {header: 'table.caller', property: 'callerName'},
        {header: 'table.subject', property: 'subjectName'},
        {header: 'table.reason', property: 'reason'},
        {header: 'table.actions', actions: ['create']}
    ];

    constructor(private apiService: ApiService, private dialogService: DialogService,
                private translate: TranslateService) {
        this.translate.onLangChange.subscribe(() => this.parseCallbacks(this.callbacks));
    }

    ngOnInit() {
        this.getCallbacks();
    }

    getCallbacks() {
        this.apiService.callbacksGET().then((data) => this.parseCallbacks(data.callbacks));
    }

    parseCallbacks(data) {
        this.callbacks = data.map(callback => {
            const userName = callback.user && callback.user.name ? callback.user.name : ' - ';
            const userLastName = callback.user && callback.user.lastName ? callback.user.lastName : ' - ';
            callback.userFullName = userName + ' ' + userLastName;
            callback.userPhone = callback.user && callback.user.phone || '-';
            callback.callerName = callback.caller && callback.caller.name ?
                callback.caller.name + ' ' + callback.caller.lastName : '';
            callback.subjectName = callback.subject ? callback.subject.name[this.translate.currentLang] : ' - ';
            return callback;
        });
    }

    editCallback(callback?) {
        this.dialogService.dialogCallbackSet(callback).subscribe(() => {
            this.getCallbacks();
        });
    }

    deleteCallback(callback?) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe((ok) => {
            if (ok) {
                this.apiService.callbackDELETE([callback._id]).then((data) => {
                    if (data.success) {
                        this.getCallbacks();
                    }
                });
            }
        });
    }
}
