import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../../services/api.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'app-page-payment-status',
    templateUrl: './page.payment-status.pug',
    styleUrls: ['./page.payment-status.scss']
})

export class PagePaymentStatus implements OnInit {
    paymentSuccess: boolean;

    constructor(
        private apiService: ApiService,
        private router: Router,
        private activeRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this.activeRoute.data.subscribe(data => {
            this.paymentSuccess = data.success;
        });
    }
}
