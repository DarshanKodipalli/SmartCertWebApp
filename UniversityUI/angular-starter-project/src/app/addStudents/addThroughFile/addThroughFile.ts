import { Component,OnInit,OnDestroy } from '@angular/core';
import { RestCallsComponent } from '../../services/httpServices';
import { ISubscription } from "rxjs/Subscription";
import { ColorsService } from '../../services/colors'; 
import { Router } from '@angular/router';
import { DataService } from "../../services/DataService";
import { DataTransferService } from "../../services/DataTransferService";

@Component({
	selector: 'app-addStudent-file',
	templateUrl: './addThroughFile.html'
})

export class StudentAdditionThroughFile implements OnInit{
	
	public ReceivedInfo:any={};
	public selectedStream1:String="";
	public selectedCourse1:String="";
	public selectedInstitution1:String="";
	public selectedYear1:String="";
	constructor(private router:Router,private http:RestCallsComponent,private dataService:DataService,private transfer:DataTransferService) {
	
	}
	ngOnInit(){
	    this.ReceivedInfo = this.transfer.getBatch();
	    console.log(this.ReceivedInfo);
	    console.log(this.ReceivedInfo.instituteName);
	    this.selectedStream1 = this.ReceivedInfo.stream;
	    this.selectedCourse1 = this.ReceivedInfo.courseName;
	    this.selectedInstitution1 = this.ReceivedInfo.instituteName;
	    this.selectedYear1 = this.ReceivedInfo.year;
	    console.log(this.selectedStream1);
	}
	onUploadSuccess(event:any){
		console.log("onUploadSuccess:")
		console.log(event);
		console.log(event.target.value)
	}
	addStudents(){
		var data = {};
		if(this.http.getStudentFile()){
				var formData = this.http.getStudentFile();
				var login = JSON.parse(localStorage.getItem("login"));
				var token = {token:login.token,url:login.url};
				formData.append("token",JSON.stringify(token));
				formData.append("AdditionalData",JSON.stringify(this.ReceivedInfo))
				this.http.massUploadStudentInformation(formData).subscribe(
					(response)=>{
									console.log(response.json())
									if(response.json()){
										this.router.navigate(["/view/StudentBatches"]);
									}
								},
					(error)=>{
						console.log(error);
					})
		}
	}
}