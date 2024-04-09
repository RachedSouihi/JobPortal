import { HostListener, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenWidthService {
  private screenWidthSource: BehaviorSubject<number> = new BehaviorSubject<number>(window.innerWidth);


  screenWidth$ = this.screenWidthSource.asObservable()
  constructor() { 
    this.onResize()

  }

  


  @HostListener('window:resize', ['$event'])
  onResize() {
    console.log(window.innerWidth)
    this.screenWidthSource.next(window.innerWidth);
    
  }


  
}
