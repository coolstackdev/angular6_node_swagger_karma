import {Component} from '@angular/core';
import {ApiService} from '../../../../services/api.service';
import {DialogService} from '../../../../services/dialog.service';

@Component({
    selector: 'app-page-admin-notice-board',
    templateUrl: './page.notice-board.pug'
})

export class AdminNoticeBoardComponent {
    notices = [];
    noticesDataHeader = [
        {header: 'table.type', property: 'type'},
        {header: 'table.title', property: 'title'},
        {header: 'table.notice', property: 'message'},
        {header: 'table.actions', actions: ['create', 'remove']},
    ];
    noticeType = {
        '0': {description: 'News'},
        '1': {description: 'Warnings'}
    };

    constructor(private apiService: ApiService,
                private dialogService: DialogService) {
        this.getNoticeMessages();
    }

    getNoticeMessages() {
        this.apiService.noticeGET().then((data) => {
            data.data.noticeMessages.map(notice => {
                notice.type = this.noticeType[notice.type].description;
                return notice;
            });
            this.notices = data.data.noticeMessages;
        });
    }

    editNotice(notice?) {
        this.dialogService.dialogNoticeSet(notice).subscribe(
            (data) => {
                if (data) {
                    this.apiService.noticeSET(data).then((res) => this.getNoticeMessages());
                }
            }
        );
    }

    deleteNotice(notice?) {
        this.dialogService.confirm('form.submit.titleSure', 'form.submit.undone').subscribe(ok => {
            if (ok) {
                this.apiService.noticeDelete([notice._id]).then(data => {
                    if (data.success) {
                        this.getNoticeMessages();
                    }
                });
            }
        });
    }
}
