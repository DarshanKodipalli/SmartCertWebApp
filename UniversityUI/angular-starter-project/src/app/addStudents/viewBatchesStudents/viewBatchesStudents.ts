import { Component,OnInit } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService"

@Component({
	selector: 'app-batch-students',
	templateUrl: './viewBatchesStudents.html'
})

export class ViewBatchesStudentsComponent implements OnInit{

public studentBatches:any=[];
	constructor(
		private http:RestCallsComponent
		,private route:Router,
		private transfer:DataTransferService){
	}
	ngOnInit(){
		this.http.getAllBatchesForStudents({}).subscribe(
			(response)=>{
				console.log(response.json())
				if(!response.json().status)
					this.studentBatches = response.json();
				else
					this.studentBatches = [];
			},
			(error)=>console.log("Error in finding the Batches"));
	}
	addStudents(){
		this.route.navigate(['addStudents/addStudentsUniversity']);
	}
	viewStudents(data){
		this.transfer.setBatch(data);
		this.route.navigate(['view/BatchStudents']);
	}
}