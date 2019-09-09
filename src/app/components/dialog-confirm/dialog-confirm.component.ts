import {Component} from '@angular/core';

@Component({
    selector: 'app-dialog-confirm',
    templateUrl: './dialog-confirm.component.pug'
})

export class DialogConfirmComponent {
    public title: string;
    public message: string;

    constructor() {

    }
}
