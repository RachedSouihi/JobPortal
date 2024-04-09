import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService } from './user-data.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private router: Router, private UserDataService: UserDataService) { }


  login(userData: any): void{
    this.UserDataService.updateUserData({...userData, isLoggedIn: true })
    this.router.navigate(['/job-portal'])

  }



  logout(userData: any): void{
    localStorage.setItem('userData', JSON.stringify({...userData, isLoggedIn: false }));
    this.router.navigate(['/login'])

  }
}
