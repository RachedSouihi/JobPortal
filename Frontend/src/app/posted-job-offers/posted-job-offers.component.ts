import { ChangeDetectorRef, Component } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { SocketIOService } from '../socket-io.service';

@Component({
  selector: 'app-posted-job-offers',
  standalone: true,
  imports: [],
  templateUrl: './posted-job-offers.component.html',
  styleUrl: './posted-job-offers.component.css'
})
export class PostedJobOffersComponent {

  userData: any;
  postedJobOffers: any



  constructor(private userDataService: UserDataService, private socketService: SocketIOService, private cdr: ChangeDetectorRef) {
    userDataService.$userData.subscribe(userData => {
      this.userData = userData;
    })


    fetch(`http://127.0.0.1:3001/getPostedJobOffers?id=${this.userData.userId}`)
      .then(response => response.json())
      .then(response => this.postedJobOffers = response.data)
      .catch(err => console.log(err))

  }



  offerDeletedSuccessfully(offerId: number): void{
    this.postedJobOffers = this.postedJobOffers.filter((jo: any) => jo.offerId !== offerId)
    this.socketService.emit("offerDeleted", offerId)



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
}
