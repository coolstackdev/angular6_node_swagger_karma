import {Component, OnInit, ViewChild} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';
import {LocalStorageService} from 'ngx-webstorage';
import {TranslateService} from '@ngx-translate/core';
import {LANGUAGES} from '../../mocks/languages';
import {Language} from '../../models/language';
// import {Socket} from 'ngx-socket-io';
// import {MENU} from '../../mocks/mock-menu';

@Component({
    selector: 'app-page-app',
    templateUrl: './page.app.pug',
    styleUrls: ['./page.app.scss']
})

export class PageApp implements OnInit {
    menu: any = [];
    user: any;
    langs: Language[];
    currentLang: string;

    constructor(private storage: LocalStorageService,
                private router: Router,
                public translate: TranslateService) {
    }

    ngOnInit() {
        this.langs = LANGUAGES;
        this.user = this.storage.retrieve('user');
        this.menu = [
            {
                name: 'page.app.home',
                icon: 'home',
                link: 'dashboard',
                level: 0
            }, {
                name: 'page.app.admin',
                icon: 'security',
                link: 'admin',
                nested: true,
                level: 5
            }, {
                name: 'page.app.lessons',
                icon: 'library_books',
                link: 'lessons',
                level: 3
            }, {
                name: 'page.app.quizzes',
                icon: 'list',
                link: 'quizzes',
                level: 3
            }, {
                name: 'page.app.homework',
                icon: 'work',
                link: 'homework',
                level: 3
            }, {
                name: 'page.app.exams',
                icon: 'work',
                link: 'exams',
                level: 3
            },
            {
                name: 'page.app.question',
                icon: 'contact_support',
                link: 'question',
                level: 3
            }, {
                name: 'page.callbackManagement.title',
                icon: 'callback',
                link: 'callbacks',
                level: 3
            }
            // {
            //     name: 'page.app.chat-management',
            //     icon: 'people',
            //     link: 'chat-management',
            //     level: '3'
            // }
        ];
        this.menu = this.menu.filter(item => item.level <= this.user.role.level);
        this.storage.observe('user').subscribe((user) => {
            if (user === null) {
                this.router.navigate(['/login']);

            }
        });
        this.storage.observe('token').subscribe((token) => {
            if (token === null) {
                this.router.navigate(['/login']);
            }
        });
        this.router.events.subscribe((event: NavigationStart) => {
            if (event instanceof NavigationStart) {
                console.log(event.url);
            }
        });
    }

    changeLanguage(e) {
        this.translate.use(e).subscribe(() => this.storage.store('ln', e));
    }
}
