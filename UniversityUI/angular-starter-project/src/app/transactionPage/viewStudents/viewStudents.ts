import { Component,OnInit } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService";

@Component({
	selector: 'app-view-students',
	templateUrl: './viewStudents.html'
})

export class  ViewTransactionStudentsComponent implements OnInit {
	public requests:any=[];
	public selectedStream1:String="";
	public selectedCourse1:String="";
	public selectedInstitution1:String="";
	public selectedYear1:String="";
	public instituteName:String="";
	public ReceivedInfo:any={};
	constructor(private http:RestCallsComponent,private route:Router,private transfer:DataTransferService) {
		console.log("studentBatchInformation:");
		console.log(this.transfer.getRequestsForInstitution());
		this.instituteName = this.transfer.getRequestsForInstitution()[0].educationalDetails[0].institutionName;
		this.requests = this.transfer.getRequestsForInstitution();
		console.log(this.requests);
	}

	ngOnInit(){
	}
	viewTransactions(data){
      this.route.navigate(['viewRequests/transaction']);
      localStorage.setItem("ViewRequestForStudent",JSON.stringify(data));
	}

}