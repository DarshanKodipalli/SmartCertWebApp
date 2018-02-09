import { Component,OnInit,OnDestroy } from '@angular/core';
import { RestCallsComponent } from '../../services/httpServices';
import { ISubscription } from "rxjs/Subscription";
import { Router } from '@angular/router';

@Component({
	selector: "ResendRejectedCertificates",
	templateUrl: './resendCertificates.html' 
})

export class ResendRejectedCertificates implements OnInit{

public selectedStudent:String;
public studentInfo:any = {};
public studentBatchInfo:any = {};
public batchYears:any = [];
public certificate:any = {};
public studentName:String;
public courseName:String;
public stream:String;
public batch:String;
public abc:ISubscription;
public uploadFile:any={};
public uploadedCertificates:any = {};
public rejectedComments:String = "";

constructor(private http:RestCallsComponent,private route:Router){
		this.uploadedCertificates = JSON.parse(localStorage.getItem("resendCertificatesPage"));
		console.log(this.uploadedCertificates);
		this.selectedStudent = this.uploadedCertificates.studentName;
		this.studentInfo = JSON.parse(localStorage.getItem("studentInfo"));
		this.studentBatchInfo = JSON.parse(localStorage.getItem("stuBatInformation"));
		this.certificate.studentName = this.uploadedCertificates.studentName;
		this.certificate.courseName = this.uploadedCertificates.courseName;
		this.certificate.stream = this.uploadedCertificates.stream;
		this.certificate.batch = this.uploadedCertificates.batch;
		this.certificate.batchId = this.uploadedCertificates.batchId;
		this.certificate.certificateName = this.uploadedCertificates.certificateName;
		this.certificate.streamName = this.uploadedCertificates.streamName;
		this.rejectedComments = this.uploadedCertificates.rejectedComments;
		this.certificate.certificateDescription = this.uploadedCertificates.certificateDescription;
		this.batchYears = [
							'Marks Sheet',
							'Transcript',
							'Degree Certificate',
							'Provisional Certificate',
							'Others'
							];
}
ngOnInit(){

}
	onChange(event:any){
		console.log("onChange");
		console.log(event);
		var files = event.srcElement.files;
		console.log(files[0]);
		this.uploadFile = files[0];
		console.log("______________");
		console.log(this.uploadFile);
		console.log("________________")
		this.certificate.certificate = files[0];
	}

ResendToSigner(data){
	console.log(data);
		if(this.http.grtTemp()){
			var formData = this.http.grtTemp();
			data.institutionId = this.uploadedCertificates.institutionId;
			data.year = this.uploadedCertificates.batch;
			data.courseName = this.uploadedCertificates.courseName;
			data.stream =  this.uploadedCertificates.stream;
			data._id = this.uploadedCertificates._id;
			formData.append('token',JSON.parse(localStorage.getItem("login")).token);
			formData.append('certificateInformation',JSON.stringify(data));
			console.log(formData);
				this.abc=this.http.resendCertificatesForApprover(formData).subscribe(
					(response)=>{console.log(response)
//						this.http.setTemp(null);
//						this.route.navigate(['institute/institutesPage']);
						},
					(error)=>console.log(error));
			}
		}

viewCertificate(){
		this.http.viewUploadedDoc({id:this.uploadedCertificates._id}).subscribe(
			(response)=>{
							console.log(response);
							var resp:any = response;
							console.log(resp);
							//console.log(response.arrayBuffer());
							var file = new Blob([resp.json()],{type:'application/pdf'});
					       // var file = response.blob();
					        var fileUrl = URL.createObjectURL(file);
      					window.open(fileUrl);
			            },
			(error)=>console.log(error));
	}
}