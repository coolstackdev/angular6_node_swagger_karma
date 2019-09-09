import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../services/api.service';
import {AbstractControl, FormBuilder} from '@angular/forms';
import {MatDialogRef} from '@angular/material';

@Component({
    selector: 'app-dialog-user-cash',
    templateUrl: './dialog-user-cash.component.pug'
})

export class DialogUserCashComponent implements OnInit {
    user: any;
    transactions = [];
    balanceControl: AbstractControl;

    constructor(private apiService: ApiService, private fb: FormBuilder, private dialog: MatDialogRef<DialogUserCashComponent>) {

    }

    ngOnInit(): void {
        this.balanceControl = this.fb.control(0);
        this.apiService.userBalanceGET(this.user).then(data => {
            this.transactions = data.transactions;
        });
    }

    getTransactionType(type) {
        let desc = '';
        switch (type) {
            case 0:
                desc = 'Orange Payment';
                break;
            case 1:
                desc = 'Paypal Payment';
                break;
            case 2:
                desc = 'Offline Payment';
                break;
            case 3:
                desc = 'Quiz Points';
                break;
            case 4:
                desc = 'Subject Purchase';
                break;
            case 5:
                desc = 'Callback';
                break;
            case 6:
                desc = 'Question';
                break;
            case 7:
                desc = 'Admin Interference';
                break;
            default:
                desc = '';
                break;
        }
        return desc;
    }

    save() {
        this.apiService.userBalanceAdd({
            points: this.balanceControl.value,
            user: this.user._id
        }).then(data => {
            if (data.success) {
                this.dialog.close('Saved');
            }
        });
    }
}
