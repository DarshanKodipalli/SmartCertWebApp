import { Component,OnInit,OnDestroy } from '@angular/core';
import { RestCallsComponent } from '../../services/httpServices';
import { ISubscription } from "rxjs/Subscription";
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService";
import { DataService } from "../../services/DataService";

declare var $: any;
declare var swal: any;
declare var approve: any;

@Component({
    selector: "certificatesToBeSigned",
    templateUrl: './approverApprovesCertificates.html'
})

export class CertificatesToBeApproved implements OnInit, OnDestroy {

    public receivedCertificateParams: any = {};
    public certificates: any = [];

    /*public initSub: ISubscription;
    public abcd: ISubscription;
    public efgh: ISubscription;*/
    public certificate: any = {};
    /*public data: any;
    public abc: any;*/
    public hideColumn: Boolean = true;
    private rejectComments:any = [];
    
    constructor(
        private http: RestCallsComponent,
        private route: Router,
        private transfer: DataTransferService,
        private dataService:DataService) {
        this.receivedCertificateParams = this.transfer.getBatch();
        this.http.getCertificatesForBatchAndInstitutionAndUniversityForApprover({
            token: JSON.parse(localStorage.getItem("login")).token,
            batch: {_id:this.receivedCertificateParams._id}
        }).subscribe(
            (response) => {
                console.log("Certificates for params:");
                console.log(response.json());
                if(!response.json().status){
	                this.certificates = response.json();
	                for (var i = 0; i < this.certificates.length; i++) {
	                    this.certificates[i].isCheckedApproved = false;
	                    this.certificates[i].selected = false;
	                    this.certificates[i].isChecked = false;
                        if(i ===0)
                            this.certificates[i].batchInfo = this.receivedCertificateParams._id;
	                }
	            }
                console.log(this.certificates);
            },
            (error) => console.log(error)
        )
    }
    ngOnInit() {}
    selectAll() {
        for (var i = 0; i < this.certificates.length; i++) {
            if (this.certificates[i].selected === true) {
                this.certificates[i].selected = false;
                if (this.certificates[i].isCheckedApproved === false) {
                    this.certificates[i].isCheckedApproved = true;
                } else {
                    this.certificates[i].isCheckedApproved = false;
                }
            } else {
                if (this.certificates[i].isCheckedApproved === false) {
                    this.certificates[i].isCheckedApproved = true;
                } else {
                    this.certificates[i].isCheckedApproved = false;
                }
                this.certificates[i].selected = true;
            }
        }
    }
    approve(a, b) {
        console.log("approve certificate");
        console.log(a);
        if (b === 1) {
            if (this.certificates[a].isCheckedApproved === false) {
                this.certificates[a].isCheckedApproved = true;
            } else {
                this.certificates[a].isCheckedApproved = false;
            }
        } else {
            this.hideColumn = false;
            if (this.certificates[a].isChecked === false) {
                this.certificates[a].isChecked = true;
            } else {
                this.certificates[a].isChecked = false;
            }
        }
    }
    RejectComments(a, b) {
        console.log("comment");
        this.certificates[a].rejectComments = b;
        console.log(this.certificates[a]);
    }
    handleRadioClick(a) {
        console.log("handleRadioClick:" + a);
    }
    viewCertificate(a) {
        console.log(a);
        this.http.viewUploadedDoc({
            token: JSON.parse(localStorage.getItem("login")).token,
            id: this.certificates[a]._id
        }).subscribe(
            (response) => {
                console.log(response);
                var resp: any = response;
                console.log(resp);
                var file = new Blob([resp.json()], {
                    type: 'application/pdf'
                });
                var fileUrl = URL.createObjectURL(file);
                window.open(fileUrl);
            },
            (error) => console.log(error));
    }
    signTheSelectedCertificates() {
          swal({
            title: 'Sign the Certificate',
            text: 'Sign the Certificates?',
            type: "info",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes!',
            cancelButtonText: 'No!',
            confirmButtonClass: 'confirm-class',
            cancelButtonClass: 'cancel-class',
            closeOnConfirm: true,
            closeOnCancel: true,
          },  function(isConfirm) {
                if (isConfirm) {
                        var reqData = [];
                        for(var i = 0;i<this.certificates.length;i++){
                            var temp:any = {};
                            temp.isCheckedApproved = this.certificates[i].isCheckedApproved;
                            temp._id  = this.certificates[i]._id;
                            temp.isChecked  = this.certificates[i].isChecked;
                            temp.rejectComments  = this.certificates[i].rejectComments;
                            temp.batchInfo = this.certificates[i].batchInfo;
                            temp.certificateHashkey = this.certificates[i].certificateHashkey;
                            reqData.push(temp);
                        }
                        var login = JSON.parse(localStorage.getItem("login")).token;
                        this.http.signTheCertificates({
                            certificates: reqData,
                            verifiedBy: login.name,
                            verifierId: login.id
                        }).subscribe(
                            (response1) => {
                                console.log(response1.json());
                                this.route.navigate(['approved/batches']);
                            },
                            (error) => {
                                console.log(error);
                            });
                } else {
                    swal("Cancelled", "No Certificate were signed)", "error");
                }
            }.bind(this));
    }

    ngOnDestroy() {
        /*if (this.initSub) {
            this.initSub.unsubscribe();
        }
        if (this.efgh) {
            this.efgh.unsubscribe();
        }*/
    }
}