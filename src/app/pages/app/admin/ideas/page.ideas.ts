import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {LocalStorageService} from 'ngx-webstorage';
import {FormBuilder, Validators} from '@angular/forms';
import {ApiService} from '../../../../services/api.service';
import {DialogService} from '../../../../services/dialog.service';

@Component({
    selector: 'app-ideas',
    templateUrl: './page.ideas.pug',
    styleUrls: ['./page.ideas.scss']
})

export class PageIdeas implements OnInit, OnDestroy {
    dataHeader = [
        {header: 'table.createdAt', property: 'createdAt'},
        {header: 'table.author', property: 'email'},
        {header: 'table.description', property: 'text'}
    ];
    ideas: any = [];
    bugs: any = [];

    constructor(private apiService: ApiService,
                private dialogService: DialogService,
                private translate: TranslateService,
                private storage: LocalStorageService) {
        this.translate.onLangChange.subscribe(() => {
        });
    }

    ngOnInit() {
        this.getIdeas();
    }

    onTabChanged(e) {
        switch (e.index) {
            case 0:
                this.getIdeas();
                break;
            case 1:
                this.getBugs();
                break;
        }
    }

    getIdeas() {
        this.apiService.ideasGET().then(data => {
            this.ideas = data.ideas.map(item => {
                item['email'] = item.author.email;
                return item;
            });
        });
    }

    getBugs() {
        this.apiService.bugsGET().then(data => {
            this.bugs = data.bugs.map(item => {
                item['email'] = item.author.email;
                return item;
            });
        });
    }

    ngOnDestroy() {

    }
}
