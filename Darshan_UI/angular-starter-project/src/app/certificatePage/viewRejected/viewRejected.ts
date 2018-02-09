import { Component,OnInit,OnDestroy } from '@angular/core';
import { RestCallsComponent } from '../../services/httpServices';
import { ISubscription } from "rxjs/Subscription";

@Component({
	selector: "rejectedCertificates",
	templateUrl: './viewRejected.html' 
})

export class RejectedCertificates implements OnInit,OnDestroy{
	public selectedBatch:String;
	public selectedInstitution:String;
	public selectedCourse:String;
	public receivedCertificateParams:Object;
	public certificates:any = [];

	public initSub:ISubscription;
	public abcd:ISubscription;
	public efgh:ISubscription;

	public data:any;
	public abc:any;
	public hideColumn:Boolean = true;
	public rejectComments:Array<String> = [""];
	constructor(private http:RestCallsComponent){
		console.log("batchInfo:");
		console.log(JSON.parse(localStorage.getItem("batchInf2")));
		this.receivedCertificateParams = JSON.parse(localStorage.getItem("batchInf2"));
		this.selectedBatch = JSON.parse(localStorage.getItem("batchInf2")).year;
		this.selectedCourse = JSON.parse(localStorage.getItem("batchInf2")).courseName;
		this.initSub = this.http.getAllRejectedCertificatesForABatch(this.receivedCertificateParams).subscribe(
			(response)=>{
				console.log("Certificates for params:");
				console.log(response.json());
				this.certificates = response.json();
				this.certificates[0].batchInfo = this.receivedCertificateParams;
				for(var i=0;i<this.certificates.length;i++){
					this.certificates[i].isCheckedApproved = false;
					this.certificates[i].isChecked = false;
					//this.certificates[i].radioData = [{id:1,optionName:"Approve",isChecked:true},{id:2,optionName:"Reject",isChecked:false,rejectComments:""}];
				}
				console.log(this.certificates);
			},
			(error)=>console.log(error)
		)
	}
	ngOnInit(){
	}
	approve(a,b){
		console.log("approve certificate");
		console.log(a);
		if(b === 1){
			if(this.certificates[a].isCheckedApproved === false){
				this.certificates[a].isCheckedApproved = true;			
			}else{
				this.certificates[a].isCheckedApproved = false;			
			}			
		}else{
			this.hideColumn = false;
			if(this.certificates[a].isChecked === false){
				this.certificates[a].isChecked = true;			
			}else{
				this.certificates[a].isChecked = false;			
			}			
		}
	}
	RejectComments(a,b){
		console.log("complete Object:");
		console.log(this.certificates[a]);
		console.log("comment");
		console.log(b);
		this.certificates[a].rejectComments = b;
		console.log(this.certificates[a]);
	}
	handleRadioClick(a){
		console.log("handleRadioClick:"+ a);
	}
	signTheSelectedCertificates(){
		console.log(this.certificates);
		this.efgh=this.http.signTheCertificates({certificates:this.certificates,verifiedBy:JSON.parse(localStorage.getItem("universityUserInfo"))[0].name,verifierId:JSON.parse(localStorage.getItem("universityUserInfo"))[0]._id}).subscribe(
			(response)=>{
							console.log(response);
							},
			(error)=>{
				console.log(error);
			});
	}

	ngOnDestroy(){
		if(this.initSub){
			this.initSub.unsubscribe();			
		}
		if(this.efgh){
			this.efgh.unsubscribe();
		}
	}
}