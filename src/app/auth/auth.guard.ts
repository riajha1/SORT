import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private router: Router) {}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
        const user = localStorage.getItem('userData');
        const isAuth = !!user;
        if (isAuth) {
            return true;
        }
        return this.router.createUrlTree(['auth'], {queryParams: {returnUrl: state.url}});
    }
}
