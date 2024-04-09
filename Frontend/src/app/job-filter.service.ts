import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobFilterService {



  private _jobFilterArray:  BehaviorSubject<any> = new BehaviorSubject<any>({"jobTitle": "", "companyLocation": "", "experience": ""});

  jobFilters$ = this._jobFilterArray.asObservable();
  constructor() { }

  updateJobFilters(filters: any): void{
    this._jobFilterArray.next(filters);
    
  }
}
