import { Component,OnInit,OnDestroy } from '@angular/core';
import { ISubscription } from "rxjs/Subscription";
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';
import { Router} from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService";

@Component({
	selector: 'file-uploadCertificate',
	templateUrl: './fileuploadCertificates.html'
})

export class  FileUploadCertificate implements OnInit,OnDestroy {

	public receivedBatchInfo:any = {};
	public receivedStudent:any = {};
	public batchYears:any = [];
	public loginInfo:any = {};
	public issueCertificate:boolean = false;
	public certificates:any = [];
	public UploadedeCertificatesToeSentToApprover:any = {};
	public certificatesSentToIssuer:boolean = false;
	public UploadedCertificates:any = [];
	public certificate:any = {};
	public transactionId:String = " ";

	constructor(
		private route:Router,
		private http:RestCallsComponent,
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
		console.log(this.receivedBatchInfo);
	}
	
	ngOnInit(){
	}

	uploadAndSendToSigner(certifi){
		console.log(certifi);
		if(this.http.grtTemp()){
			var formData = this.http.grtTemp();
			var batchId = {_id:this.receivedBatchInfo._id,institutionId:this.receivedBatchInfo.institutionId,institutionName:this.receivedBatchInfo.institutionName,courseName:this.receivedBatchInfo.courseName,streamName:this.receivedBatchInfo.stream,batch:this.receivedBatchInfo.year};
			console.log(formData);
			formData.append("token",this.loginInfo.token);
			formData.append("certificateInformation",JSON.stringify(certifi));
			formData.append("batchInfo",JSON.stringify(batchId));
			formData.append("loginInfo",JSON.stringify(this.loginInfo));
			this.http.massUploadCertificates(formData).subscribe(
				(response)=>{
					var resp = response.json();
					console.log(resp);
					this.UploadedCertificates = resp.docs ||[];
					console.log(this.UploadedCertificates);
					if(!resp.status){
						console.log("check");
						this.issueCertificate = true;
						this.transactionId = resp.transactionId;
					}					
				},
				(error)=>console.log(error));
			}			
	}

	viewCertificate(i){
		console.log(this.UploadedCertificates[i]);
		this.http.viewUploadedDoc({id:this.UploadedCertificates[i]._id}).subscribe(
			(response)=>{
				console.log(response);
				var file = new Blob([response.json()],{type:'application/pdf'});
				var fileUrl = URL.createObjectURL(file);
      			window.open(fileUrl);
			},
			(error)=>console.log(error));

	}

	SenditToApprover(){
		console.log(this.UploadedCertificates);
		var batchId = this.UploadedCertificates[0].batchId;
		this.UploadedeCertificatesToeSentToApprover = {
			transactionId:this.transactionId,
			batchId:batchId,
			batchAddress:this.receivedBatchInfo.blockChainAddress						
		};
		this.certificatesSentToIssuer = true;
		this.http.SendUploadedCertificatesToSigner(this.UploadedeCertificatesToeSentToApprover).subscribe(
			(response)=>{
				console.log(response);
				if(response.json().status === 1){					
					this.route.navigate(['/institute/institutesPage']);
				}
			},(error)=>{
				console.log(error);
			});
	}
	CancelIssueingCertificate(){
		var deleteCertificates = {
			token:this.loginInfo.token,
			transactionId:this.transactionId					
		};
		console.log("Cancel Initiated");
  		this.http.cancelMassuploadTransaction(deleteCertificates).subscribe(
  			(response)=>{
  				if(response.json().status===1){
  					this.route.navigate(['/institute/institutesPage'])
  				}
  				console.log("certificates Deleted Successfully");
  			},
  			(error)=>{
  				console.log("Could'nt delete");
  			})		
	}
	  ngOnDestroy(){
	  	if(this.certificatesSentToIssuer === true){
	  		console.log("Certificates Sent to the approver")
	  	}else{
		var deleteCertificates = {
			token:this.loginInfo.token,
			transactionId:this.transactionId						
		};
	  	console.log("Certificates not sent to the approver, Delete Them.")
	  	this.http.cancelMassuploadTransaction(deleteCertificates).subscribe(
	  		(response)=>{
	  			console.log("certificates Deleted Successfully");
	  		},
	  		(error)=>{
	  			console.log("Could'nt delete");
	  		});
	  	}
    }	
}