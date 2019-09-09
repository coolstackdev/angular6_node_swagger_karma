import {Directive, Input} from '@angular/core';
import {NG_VALIDATORS, Validator, FormControl} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

@Directive({
    selector: '[customMin][formControlName],[customMin][formControl],[customMin][ngModel]',
    providers: [{provide: NG_VALIDATORS, useExisting: CustomMinDirective, multi: true}]
})
export class CustomMinDirective implements Validator {
    @Input() customMin: number;
    constructor (private translate: TranslateService) {}

    validate(c: FormControl): { [key: string]: any } {
        return (this.customMin && c.value && (c.value < this.customMin)) ? {'customMin': this.translate.instant('application.customMin')} : null;
    }
}

@Directive({
    selector: '[customMax][formControlName],[customMax][formControl],[customMax][ngModel]',
    providers: [{provide: NG_VALIDATORS, useExisting: CustomMaxDirective, multi: true}]
})
export class CustomMaxDirective implements Validator {
    @Input() customMax: number;
    constructor (private translate: TranslateService) {}

    validate(c: FormControl): { [key: string]: any } {
        return (this.customMax && c.value && (c.value > this.customMax)) ? {'customMax': this.translate.instant('application.customMax')} : null;
    }
}
