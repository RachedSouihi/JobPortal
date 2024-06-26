import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from '@angular/router';

import { LoginService } from '../login.service';
import { ElementRef } from 'react';
import { Toast } from 'bootstrap';


@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent implements OnInit, AfterViewInit {


  loginForm: FormGroup;

  @ViewChild('toast') toastElement!: ElementRef<HTMLElement>;


  screenWidth: number = window.innerWidth;
  constructor(private fb: FormBuilder, private LoginService: LoginService){
    this.loginForm = fb.group({
      email: ['', [Validators.email ,Validators.required]],
      password:  ['', [Validators.minLength(6), Validators.required]]

    })

  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    const toast = new Toast(this.toastElement.nativeElement);
    toast.show();
    
  }


  loggedInSuccessfully(data: any): void{
    alert('ok')
    setTimeout(() => {
      

      //this.LoginService.login(data)
    }, 4000)

  }
 
  logIn(): void{
    fetch("http://127.0.0.1:3001/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(this.loginForm.value)
    })
    .then(response => response.json())
    .then(response => response.success ? this.loggedInSuccessfully(response.data) : console.log(response.message))
    .catch(err => console.log(err.message))
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth
  }

}
