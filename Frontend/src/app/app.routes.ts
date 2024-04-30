import { Routes } from '@angular/router';
import { LogInComponent } from './log-in/log-in.component';
import { HomeComponent } from './home/home.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { JobOfferComponent } from './job-offer/job-offer.component';
import { ApplyForJobComponent } from './apply-for-job/apply-for-job.component';
import { MyApplicationsComponent } from './my-applications/my-applications.component';
import { PostJobOfferComponent } from './post-job-offer/post-job-offer.component';
import { AuthGuard } from '../auth.guard';
import { PostedJobOffersComponent } from './posted-job-offers/posted-job-offers.component';
import { ApplicantsComponent } from './applicants/applicants.component';
import { MainPageComponent } from './main-page/main-page.component';
import { ApplicantInfoComponent } from './applicant-info/applicant-info.component';

export const routes: Routes = [
    {path: "job-portal", component: MainPageComponent, children:[
        {path: '', component: JobOfferComponent, canActivate: [AuthGuard]},
        {path: 'submitted-candidacy', component: MyApplicationsComponent},
        {path: 'posted-job-offers', component: PostedJobOffersComponent},
        {path: 'apply/:hiring_mgr_id/:offer_id/:job/:company', component: ApplyForJobComponent},

        {path: 'edit/:user_id/:offer_id/:job', component: ApplyForJobComponent},
        {path: 'post-job-offer', component: PostJobOfferComponent},
        {path: 'edit-job-offer/:offerId', component: PostJobOfferComponent},
        {path: 'applications', component: ApplicantsComponent},
        {path: 'applications/:offerId/:jobTitle', component: ApplicantsComponent},
        {path: "applicant/:applicantId", component: ApplicantInfoComponent}
    ]},
    {path: "signup", component: SignUpComponent},
        {path: "signup", component: SignUpComponent},
        {path: "login", component: LogInComponent},




    {path:'', component: HomeComponent},
    
    
];
