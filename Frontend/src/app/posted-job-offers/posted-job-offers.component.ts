import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { SocketIOService } from '../socket-io.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-posted-job-offers',
  standalone: true,
  imports: [],
  templateUrl: './posted-job-offers.component.html',
  styleUrl: './posted-job-offers.component.css'
})
export class PostedJobOffersComponent implements OnInit {

  userData: any;
  postedJobOffers: any = []
  postedJobOffersToDisplay: any = []
  filterOffers: any = {}





  constructor(private userDataService: UserDataService, private socketService: SocketIOService, private router: Router, private cdr: ChangeDetectorRef) {
    userDataService.$userData.subscribe(userData => {
      this.userData = userData;
    })


    fetch(`http://127.0.0.1:3001/getPostedJobOffers?id=${this.userData.userId}`)
      .then(response => response.json())
      .then(response => {this.postedJobOffers = response.data; this.postedJobOffersToDisplay = this.postedJobOffers})
      .catch(err => console.log(err))

  }

  ngOnInit(): void {
    this.socketService.on('newJobOffer').subscribe(newJobOffer => {
      if(newJobOffer.hiring_mgr_id == this.userData.userId){
      this.postedJobOffers.push(newJobOffer)
      this.postedJobOffersToDisplay = this.postedJobOffers
      this.cdr.detectChanges()
      }


    })
  }



  offerDeletedSuccessfully(offerId: number): void{
    this.postedJobOffers = this.postedJobOffers.filter((jo: any) => jo.offerId !== offerId)
    this.postedJobOffersToDisplay = this.postedJobOffersToDisplay.filter((jo: any) => jo.offerId !== offerId)
    this.socketService.emit("offerDeleted", offerId)
    



  }



  editOffer(offerId: number): void{
    this.router.navigate([`/job-portal/edit-job-offer/${offerId}`])

  }
  deleteOffer(offerId: number): void {
   fetch('http://127.0.0.1:3001/deleteOffer', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },



      body: JSON.stringify({offerId: offerId})
    })

    .then(response => response.json())
    .then(response => response.success ? this.offerDeletedSuccessfully(offerId) : alert('Error when deleting job offer, please try again!'))
  
  }




  handleFilterOffers(key: any, event: any): void{
    this.filterOffers[key] = event.target.value;


    this.postedJobOffersToDisplay = this.postedJobOffers.map((offer: any) => {
    
      if(this.filterOffers.month){
        const date = new Date(offer.timestamp)
        const month = date.getMonth() + 1;
        if(month == this.filterOffers.month || this.filterOffers.month == "all month"){
            return offer

        }


      }else{return null}
    })

    this.postedJobOffersToDisplay = this.postedJobOffersToDisplay.filter((offer: any) => offer !== null && offer !== undefined)
    console.log(this.postedJobOffersToDisplay)
    this.cdr.detectChanges()



    

  }
}
