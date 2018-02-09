import { Component,OnInit } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService";
import { DataService } from "../../services/DataService";

@Component({
	selector: 'app-see-students',
	templateUrl: './seeStudents.html'
})

export class  SeeStudentsComponent implements OnInit {
	public studentInformation:any=[];
	public ReceivedInfo:any={};

	public selectedStudentInContent:String = "";
	public selectedCourseInContent:String = "";
	public selectedStreamInContent:String = "";
	public receivedBatchInfo:any = {};
	public receivedStudent:any = {};
	public certificate:any = {};
	public universityInformation:any = {};
	public certificateContent1:String = "";
	public certificateContent2:String = "";
	public certificateContent3:String = "";
	public classes:any = [];
	public streamsss:any = [];
	public selectedClass:String = "";
	public awardedDate:String="";

	constructor(
		private http:RestCallsComponent,
		private route:Router,
		private dataService:DataService,
		private transfer:DataTransferService) {
		this.receivedStudent = this.transfer.getStudent();
		this.receivedBatchInfo = this.transfer.getBatch();
		this.universityInformation = this.dataService.getUniversityData();
		this.selectedCourseInContent = this.receivedBatchInfo.courseName;

		this.awardedDate = new Date().toISOString().split("T")[0];
		this.selectedClass = 'First Class with Distinction';
		this.receivedStudent = this.transfer.getStudent();
		this.receivedBatchInfo = this.transfer.getBatch();
		this.universityInformation = this.dataService.getUniversityData();
		this.selectedStudentInContent = this.receivedStudent.name;
		this.selectedCourseInContent = this.receivedBatchInfo.courseName;
		this.streamsss.push(this.receivedBatchInfo.stream);
		this.selectedStreamInContent = this.receivedBatchInfo.stream;
		this.certificate.universityInformation = this.universityInformation.name+" ,"+this.universityInformation.city+" ,"+this.universityInformation.state;
		this.certificateContent1 = "Certifies that ";
		this.certificateContent2 = " has been duly admitted to the degree of ";
		this.certificateContent3 = " in recognition of the fulfilment of requirements for the said degree";
		this.certificate.universityNumber = this.receivedStudent.rollNumber;		
	}

	ngOnInit(){
		console.log("stuBatInformation:");
		this.ReceivedInfo = this.transfer.getBatch();
		console.log(this.ReceivedInfo);
		var query = {
			batchInfo:{_id:this.ReceivedInfo._id}
		};
		console.log(query);
		this.http.getAllStudentsForABatch(query).subscribe(
			(response)=>{
				if(!response.json().status){
					this.studentInformation = response.json();
				}else{
					console.log(response.json());
					console.log("seeStudentComponent : init");
				}
			},
			(error)=>console.log(error));
	}
	uploadCertificates(data){
		this.transfer.setStudent(data);
		this.transfer.setBatch(this.ReceivedInfo);
		this.route.navigate(['choose/uploadMethod']);
	}
	createCertificatesForAll(){

		this.route.navigate(["create/MassCertificates"]);
		
	}
}