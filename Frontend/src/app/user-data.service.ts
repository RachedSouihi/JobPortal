import { ChangeDetectorRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private _userData: BehaviorSubject<any> = new BehaviorSubject<any>({});
  $userData = this._userData.asObservable()

  constructor() {
    const localUserData = localStorage.getItem("userData") || "";
      this._userData.next(JSON.parse(localUserData));

   
     
    

  }

  

  updateUserData(data: any){
    localStorage.setItem('userData', JSON.stringify(data))
    this._userData.next(data)


    
  }
}
