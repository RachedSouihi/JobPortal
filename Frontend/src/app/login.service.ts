import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService } from './user-data.service';
import { SocketIOService } from './socket-io.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private router: Router, private UserDataService: UserDataService, private SocketService: SocketIOService) { }


  login(userData: any): void{
    this.UserDataService.updateUserData({...userData, isLoggedIn: true })
    this.router.navigate(['/job-portal'])

  }



  logout(userData: any): void{
    this.router.navigate(['/login'])

  }
}
