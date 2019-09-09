import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {LocalStorageService} from 'ngx-webstorage';
import {ApiService} from './api.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private storage: LocalStorageService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.storage.retrieve('token')) {
            return true;
        }

        this.router.navigate(['/login']);
        return false;
    }
}

@Injectable()
export class AuthLoginRedirect implements CanActivate {

    constructor(private router: Router, private storage: LocalStorageService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (!this.storage.retrieve('token')) {
            return true;
        }

        this.router.navigate(['/app']);
        return false;
    }
}

@Injectable()
export class AuthAdmin implements CanActivate {
    constructor(private router: Router, private storage: LocalStorageService, private apiService: ApiService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.apiService.role) {
            if (this.apiService.role >= 5) {
                return true;
            } else {
                this.router.navigate(['/app']);
                return false;
            }
        } else {
            return this.apiService.currentUserRoleGET().then((response) => {
                if (response.level >= 5) {
                    return true;
                } else {
                    this.router.navigate(['/app']);
                    return false;
                }
            });
        }
    }
}

@Injectable()
export class AuthTeacher implements CanActivate {
    constructor(private router: Router, private apiService: ApiService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.apiService.role) {
            if (this.apiService.role >= 3) {
                return true;
            } else {
                this.router.navigate(['/app']);
                return false;
            }
        } else {
            return this.apiService.currentUserRoleGET().then((response) => {
                if (response.level >= 3) {
                    return true;
                } else {
                    this.router.navigate(['/app']);
                    return false;
                }
            });
        }
    }

}
