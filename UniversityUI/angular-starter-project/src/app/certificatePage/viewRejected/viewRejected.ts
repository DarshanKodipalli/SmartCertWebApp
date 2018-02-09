import { Component,OnInit,OnDestroy } from '@angular/core';
import { RestCallsComponent } from '../../services/httpServices';
import { ISubscription } from "rxjs/Subscription";
import { Router } from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService";

@Component({
	selector: "rejectedCertificates",
	templateUrl: './viewRejected.html' 
})

export class RejectedCertificates implements OnInit,OnDestroy{
	public selectedBatch:String;
	public selectedInstitution:String;
	public selectedCourse:String;
	public receivedCertificateParams:Object;
	public approvedCertificatesList:any = [];
	public rejectedCertificatesList:any = [];
	public certificates:any = [];
	public certificateDecscription:String;
	public rejectedCertificates:boolean = true;
	public approvedCertificates:boolean = false;
	public noApprovedCertificates:boolean = false;
	public noRejectedCertificates:boolean = true;

	public initSub:ISubscription;
	constructor(private http:RestCallsComponent,private route:Router,private transfer: DataTransferService){
		console.log("batchInfo:");
		console.log(this.transfer.getVerifiedBatchesForIssuer());
		this.receivedCertificateParams = this.transfer.getVerifiedBatchesForIssuer();
		this.selectedBatch = this.transfer.getVerifiedBatchesForIssuer().year;
		this.selectedCourse = this.transfer.getVerifiedBatchesForIssuer().courseName;
		this.certificateDecscription = this.transfer.getVerifiedBatchesForIssuer().certificateDescription;
		this.initSub = this.http.getAllVerifiedCertificatesForABatch({token:JSON.parse(localStorage.getItem("login")).token,batch:this.receivedCertificateParams}).subscribe(
			(response)=>{
				console.log("Certificates for params:");
				console.log(response.json());
				this.certificates = response.json();
				for(var i=0;i<this.certificates.length;i++){
					if(this.certificates[i].approved === true){
						this.noApprovedCertificates = true;
						this.approvedCertificatesList.push(this.certificates[i]);
					}
				}
			},
			(error)=>console.log(error)
		)
	}
	ngOnInit(){
	}
	viewApproved(){
		this.approvedCertificates = true;
		this.rejectedCertificates = true;
		this.noApprovedCertificates = false;
		this.noRejectedCertificates = true;
		this.approvedCertificatesList = [];
		for(var i=0;i<this.certificates.length;i++){
			if(this.certificates[i].approved === true){
				this.noApprovedCertificates = true;
				this.approvedCertificates = false;
				this.approvedCertificatesList.push(this.certificates[i]);
			}
		}
		console.log("Approved Certificates");
		console.log(this.approvedCertificatesList);
	}
	resendCertificatesPage(index){
		localStorage.setItem("resendCertificatesPage",JSON.stringify(this.rejectedCertificatesList[index]));
		this.route.navigate(['resend/rejectedCertificates']);
	}
	viewRejected(){
		this.rejectedCertificates = true;
		this.approvedCertificates = true;
		this.noRejectedCertificates = false;
		this.noApprovedCertificates = true;
		this.rejectedCertificatesList = [];
		for(var i=0;i<this.certificates.length;i++){
			if(this.certificates[i].approved === false){
				this.noRejectedCertificates = true;
				this.rejectedCertificates = false;
				this.rejectedCertificatesList.push(this.certificates[i]);
			}
		}
		console.log("rejected Certificatees:");
		console.log(this.rejectedCertificatesList);
	}
	ngOnDestroy(){
		if(this.initSub){
			this.initSub.unsubscribe();			
		}
	}
}