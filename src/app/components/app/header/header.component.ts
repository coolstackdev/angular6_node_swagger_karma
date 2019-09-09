import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LocalStorageService} from 'ngx-webstorage';
import {Router} from '@angular/router';
import {Language} from '../../../models/language';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.pug',
    styleUrls: ['./header.component.scss']
})

export class HeaderComponent {
    @Input() user: any;
    @Input() currentLang: string;
    @Input() langs: Language[];
    @Output() changeLanguage = new EventEmitter<undefined>();
    @Output() sideNavOpen = new EventEmitter<undefined>();
    @Output() logout = new EventEmitter<undefined>();

    constructor(private router: Router, private storage: LocalStorageService) {
    }

    userLogout() {
        this.storage.store('user', null);
        this.storage.store('token', null);
        this.router.navigate(['/login']);
    }

}
