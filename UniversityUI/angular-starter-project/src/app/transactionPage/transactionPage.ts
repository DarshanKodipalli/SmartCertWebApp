import { Component } from '@angular/core';
import { RestCallsComponent } from '../services/httpServices';
import { Router } from '@angular/router';

@Component({
  selector: 'transactionPage',
  templateUrl:"../transactionPage/transactionPage.html" 
})
export class TransactionPageComponent {
    public studentInformation:any=[];
  constructor(private http:RestCallsComponent,private route:Router) {  	
      var query = {
              token:JSON.parse(localStorage.getItem("login")).token
            };
      this.http.getListofStudents(query).subscribe(
        (response)=>{
                this.studentInformation = response.json();
              },
        (error)=>console.log(error));
    }
    viewRequestsForStudent(i){
      this.route.navigate(['viewRequests/transaction']);
      localStorage.setItem("ViewRequestForStudent",JSON.stringify(this.studentInformation[i]));
    }
  }