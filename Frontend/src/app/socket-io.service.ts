import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import * as io from "socket.io-client"
const socket = io.connect("http://127.0.0.1:3001")

@Injectable({
  providedIn: 'root'
})
export class SocketIOService {

  public socket: any = socket


  constructor() {



  }






  on(eventName: string): Observable<any> {



    return new Observable((observer) => {


      socket.on(eventName, (data: any) => {
        
        observer.next(data)
      })
    })
  }

  emit(eventName: string, data: any): void {
    socket.emit(eventName, data)
  }




}

