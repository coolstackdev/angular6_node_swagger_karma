import {Component, EventEmitter, Output, Input, OnInit} from '@angular/core';
import {FormGroup, Validators, FormBuilder} from '@angular/forms';

@Component({
    selector: 'app-refill-points',
    templateUrl: './refill-points.component.pug'
})

export class RefillPointsComponent implements OnInit {
    @Output() changeRefillPoints = new EventEmitter<{ name: string, value: number }>();
    @Input() pricePerPoint: number;
    form: FormGroup;

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            pricePerPoint: [this.pricePerPoint, [Validators.required]]
        });
    }

    submitForm() {
        if (this.form.valid) {
            this.changeRefillPoints.emit({name: 'pricePerPoint', value: this.form.value.pricePerPoint});
        }
    }
}
