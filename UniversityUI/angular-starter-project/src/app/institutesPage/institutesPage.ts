import { Component,OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router'
import { DataTransferService } from "../services/DataTransferService";

@Component({
  selector: 'institutesPage',
  templateUrl: '../institutesPage/institutesPage.html'
})


export class InstitutePageComponent implements OnInit {
public studentBatches:any=[];
  constructor(
    private http:RestCallsComponent,
    private route:Router,
    private transfer:DataTransferService){

  }
  ngOnInit(){
    this.http.getAllBatchesForStudents({}).subscribe(
      (response)=>{
         if(!response.json().status){
                this.studentBatches = response.json();
              }
              else{
                console.log(response.json());
                this.studentBatches = [];
              }
            },
      (error)=>console.log("Error in finding the Batches"));
  }
  viewStudents(data){
        console.log("View Students:");
        console.log(data);
        this.transfer.setBatch(data);
        this.route.navigate(['certificate/uploadDecision']);
  }
}
