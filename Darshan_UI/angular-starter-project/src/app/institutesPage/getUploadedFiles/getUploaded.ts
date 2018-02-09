import { Component,OnInit,OnDestroy } from '@angular/core';
import { RestCallsComponent } from '../../services/httpServices';
import { ISubscription } from "rxjs/Subscription";
@Component({
	selector: "getUploaded",
	templateUrl: './getUploaded.html' 
})

export class GetUploadedFilesComponent implements OnInit,OnDestroy{
	public selectedBatch:String;
	public selectedInstitution:String;
	public selectedCourse:String;
	public receivedCertificateParams:Object;
	public certificates:any = [];

	public initSub:ISubscription;
	public abcd:ISubscription;

	public data:any;
	public abc:any;
	constructor(private http:RestCallsComponent){
	}
	ngOnInit(){
		console.log("batchInfo:");
		console.log(JSON.parse(localStorage.getItem("certificateParams")));
		this.receivedCertificateParams = JSON.parse(localStorage.getItem("certificateParams"));
		this.selectedBatch = JSON.parse(localStorage.getItem("certificateParams")).batchInfo;
		this.selectedCourse = JSON.parse(localStorage.getItem("certificateParams")).courseInfo;
		this.selectedInstitution = JSON.parse(localStorage.getItem("certificateParams")).instituteInfo;
		this.initSub = this.http.getCertificatesForBatchAndInstitutionAndUniversity(this.receivedCertificateParams).subscribe(
			(response)=>{
				console.log("Certificates for params:");
				console.log(response.json());
				this.certificates = response.json();
				console.log(this.certificates);
			},
			(error)=>console.log(error)
		)
	}
	sendCertificatesTOSigner = function(){
		console.log(this.certificates);
		this.abcd = this.http.sendCertificatesForSigner(this.receivedCertificateParams).subscribe(
			(response)=>{
							console.log(response)
							this.data = response;
						},
			(error)=>console.log(error));
	}
	ngOnDestroy(){
		if(this.initSub){
			this.initSub.unsubscribe();			
		}
		if(this.abcd){
			this.abcd.unsubscribe();			
		}
	}
}