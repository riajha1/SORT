import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
    private refreshTokenInprogress = false;
    constructor(private authService: AuthService) {}
    // Add token to others request

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const tokenAvailable = this.authService.validateToken();
        const userData = localStorage.getItem('userData');
        // console.log('userData', userData);
        // console.log('Token', tokenAvailable);
        if (tokenAvailable === null && userData !== null) {
            // console.log('UserData', userData);
            if (!this.refreshTokenInprogress) {
                // console.log('interceptor');
                this.refreshTokenInprogress = true;
                this.authService.refreshSession().subscribe(e => this.refreshTokenInprogress = false);
            }
        }
        return next.handle(req);
    }
}
