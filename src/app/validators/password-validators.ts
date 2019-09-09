import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from '@angular/forms';

export class PasswordValidators {
    static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (!control.value) {
                // if control is empty return no error
                return null;
            }
            // test the value of the control against the regexp supplied
            const valid = regex.test(control.value);
            // if true, return no error (no error), else return error passed in the second parameter
            return valid ? null : error;
        };
    }

    static passwordMatchValidator(control: FormGroup) {
        if (control.contains('password') && control.contains('confirmPassword')) {
            const password: string = control.controls['password'].value; // get password from our password form control
            const confirmPassword: string = control.controls['confirmPassword'].value; // get password from our confirmPassword form control
            if (password !== confirmPassword) {
                // if they don't match, set an error in our confirmPassword form control
                control.get('confirmPassword').setErrors({ noPassMatch: true });
            }
        }
    }
}
