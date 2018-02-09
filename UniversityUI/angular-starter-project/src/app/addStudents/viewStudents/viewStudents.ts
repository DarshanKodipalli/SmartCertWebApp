import { Component,OnInit } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService"

@Component({
	selector: 'app-view-students',
	templateUrl: './viewStudents.html'
})

export class  ViewStudentsComponent implements OnInit {
	public studentInformation:any=[];
	public receivedInfo:any={};
	constructor(
		private http:RestCallsComponent,
		private route:Router,
		private transfer:DataTransferService) {
	}

	ngOnInit(){
		this.receivedInfo = this.transfer.getBatch();
		var query = {
						token:JSON.parse(localStorage.getItem("login")).token,
						batchInfo:{batchId:this.receivedInfo._id}
					};
		this.http.getAllStudentsForABatch(query).subscribe(
			(response)=>{
				if(!response.json().status)
					this.studentInformation = response.json();
				else
					this.studentInformation = [];
				console.log(response.json());
						},
			(error)=>console.log(error));
	}

}