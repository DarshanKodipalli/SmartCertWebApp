import { Component,OnInit } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService";
import { DataService } from "../../services/DataService";

@Component({
	selector: 'app-create-certificate',
	templateUrl: './createCertificate.html'
})

export class  CreateCertificateComponent implements OnInit {

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
	private route:Router,
	private http:RestCallsComponent,
	private transfer:DataTransferService,
	private dataService:DataService){	
	this.receivedStudent = this.transfer.getStudent();
	this.receivedBatchInfo = this.transfer.getBatch();
	this.universityInformation = this.dataService.getUniversityData();
	this.selectedCourseInContent = this.receivedBatchInfo.courseName;
}
ngOnInit(){
	this.streamsss = [];
	this.classes = [
		'First Class with Distinction',
		'First Class',
		'Second Class',
		'Third Class',
		'Fail'
	];
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
preview = function(data){
	console.log(data);
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
				this.abc=this.http.certificatePreview(requestData).subscribe(
					(response)=>{
								console.log(response)
								this.http.setTemp(null);
								var resp:any = response;
								console.log(resp);
								var file = new Blob([resp.json()],{type:'application/pdf'});
						        var fileUrl = URL.createObjectURL(file);
		      					window.open(fileUrl);
						},
					(error)=>console.log(error));
			}
}