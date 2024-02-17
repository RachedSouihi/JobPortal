import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { gsap } from "gsap"
import { Subject } from 'rxjs';
import { ScreenWidthService } from '../screen-width.service';
import { animate, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-100px)' }),
        animate('1.8s ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  screenWidth: number;

  constructor(private router: Router) {
    /* this.screenWidthService.screenWidth$.subscribe(width => {
       console.log(width)
       this.screenWidth = width;
   
     })*/

    this.screenWidth = window.innerWidth;

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth
  }













  ngOnInit(): void {


   /* const aNavItems = document.querySelectorAll('.a-navbar-item')
    aNavItems.forEach((item, i) => {
      setTimeout(() => {
        gsap.fromTo(item, {
          opacity: 0,
          y: -100,


        }, {
          opacity: 1,
          y: 0,
          duration: 1.8,
          ease: "power2.out"

        })

      }, 200 * i)
    })*/

  }


  signUp(): void {
    const btn = document.querySelector('.signup-btn');

    btn?.classList.toggle('bgCol');

    const timeout = setTimeout(() => {
      btn?.classList.toggle('bgCol');
      this.router.navigate(['/signup'])


    }, 200)







  }

}
