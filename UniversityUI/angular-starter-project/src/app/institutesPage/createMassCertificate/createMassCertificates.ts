import { Component,OnInit,OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService";
import { DataService } from "../../services/DataService";

@Component({
	selector: 'mass-CertificateCreate',
	templateUrl: './createMassCertificates.html'
})

export class  MassCertificateCreation{

	public receivedBatchInfo:any = {};
	public receivedStudent:any = {};
	public batchYears:any = [];
	public loginInfo:any = {};
	public issueCertificate:boolean = false;
	public certificates:any = [];
	public UploadedeCertificatesToeSentToApprover:any = {};
	public certificatesSentToIssuer:boolean = false;
	public CreatedCertificates:any = [];
	public certificate:any = {};
	public transactionId:String = " ";
	public selectedStudentInContent:String = "";
	public selectedCourseInContent:String = "";
	public selectedStreamInContent:String = "";
	public universityInformation:any = {};
	public certificateContent1:String = "";
	public certificateContent2:String = "";
	public certificateContent3:String = "";
	public classes:any = [];
	public streamsss:any = [];
	public selectedClass:String = "";
	public awardedDate:String="";
	public massUploadId:String = "";

	constructor(
		private route:Router,
		private http:RestCallsComponent,
		private dataService:DataService,
		private transfer:DataTransferService){
		this.receivedStudent = this.transfer.getStudent();
		this.receivedBatchInfo = this.transfer.getBatch();
		this.loginInfo = JSON.parse(localStorage.getItem('login'));
		this.batchYears = [
			'Marks Sheet',
			'Transcript',
			'Degree Certificate',
			'Provisional Certificate',
			'Others'
		];
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
		console.log(this.receivedBatchInfo);
	}
	
	createCertificates(a){
		console.log("Create Certificates for all");
		this.certificate.selectedStudentInContent = this.selectedStudentInContent;
		this.certificate.selectedCourseInContent = this.selectedCourseInContent;
		this.certificate.selectedStreamInContent = this.selectedStreamInContent;
		this.certificate.certificateContent1 = this.certificateContent1;
		this.certificate.certificateContent2 = this.certificateContent2;
		this.certificate.certificateContent3 = this.certificateContent3;
		this.certificate.selectedClass = this.selectedClass;
		this.certificate.city=this.universityInformation.city;
		this.certificate.awardedDate = this.awardedDate;
		console.log(this.certificate);
		var requestData = {
			token:JSON.parse(localStorage.getItem("login")).token,
			certificateInformation:JSON.stringify(this.certificate),
			studentInformation:JSON.stringify(this.receivedStudent),
			batchInfo:JSON.stringify(this.receivedBatchInfo),
			loginInfo:localStorage.getItem("login")
		};
		this.http.createCertificateForAll(requestData).subscribe(
			(response)=>{
						console.log(response.json());
						this.issueCertificate = true;
						this.massUploadId = response.json().transactionId;
						this.CreatedCertificates = response.json().CertificatesToBeSent;
				},
			(error)=>console.log(error));
	}
	CancelIssueingCertificate(){
		this.route.navigate(["/institute/institutesPage"]);
	}
	viewCertificate(i){
		console.log(i);
	}
	SenditToApprover(){
		this.http.SendMassCreateCertificates({transactionId:this.massUploadId,loginInfo:this.loginInfo,batchInfo:this.receivedBatchInfo}).subscribe(
			(response)=>{
				console.log(response);
			},
			(error)=>console.log(error))
	}
}