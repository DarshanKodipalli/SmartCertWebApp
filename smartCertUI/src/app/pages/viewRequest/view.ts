import { Component,OnInit } from '@angular/core';
import { AppComponent } from '../../app.component';
import { HttpService } from '../../services/HttpService';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver';
import 'rxjs/Rx';

declare var $: any;
declare var approve: any;
declare var swal: any;

@Component({
  selector: 'view',
  templateUrl: './view.html'
})


export class ViewComponent implements OnInit {

    private token: String = "";
    public flag: number = 0;
    private ip: string = ""

    public emailId: String = "";
    public phoneNumber: String = "";
    public otp:String = "";
    public certificates:any = [];
    public studentAddress:String = "";

    constructor(private app: AppComponent, private http: HttpService, private router: Router) {
        const body = $('body');
        body.attr('data-collapsed', true);
        body.attr('data-navbar','dark');
        body.attr('data-background',"dark");
        var data = this.router.url.split('/');
        var token = data[data.length-1].toString().split("---");
        this.token = token[0];
        this.ip = atob(token[1]||" ");
        this.token = this.token+"---"+btoa(this.ip);
        console.log(this.ip);
        console.log(token);
        console.log(data);
        this.http.validateConsumnerLink({
            token: this.token,
            ip: this.ip
        }).subscribe(
            (response) => {
                if (response.json().token) {
                    console.log("data");
                    this.studentAddress = response.json().studentAddress;
                    console.log(response.json());
                    this.flag = 1;
                } else {
                    this.router.navigate(['page/not/found']);
                }
            },
            (error) => {
                console.log(error);
                console.log("validateConsumerLink");
            }
        );

    }
    ngOnInit() {
        $('[data-approve-field]').on('change', function(e) {
            var field = $(this).attr('data-approve-field');
            var title = $(this).attr('data-approve-title');
            var required = $(this).attr('data-approve-required') === 'true' ? true : false;
            var success = $(this).attr('data-approve-success');
            var error = $(this).attr('data-approve-error');
            var target = $(this).attr('data-approve-target');
            this.validateOnChange('[data-approve-field="' + field + '"]', {
                title: title,
                required: required
            }, success, error);
            console.log(field, title, required, success, error, target);
        });
        this.validateOnChange('#email', {
            title: 'Email',
            required: true,
            email: true
        }, "Email is valid", "Please enter a valid email Id");
        this.validateOnChange("#phone", {
            title: "Phone",
            required: true
        }, "Phone number is valid", "Enter a valid Phone number");
    }

    checkCredentials() {
        if (this.flag === 1) {
            var data:any = {};
            data.token = this.token;
            data.emailId = this.emailId;
            data.ip = this.ip;
            console.log(data);
            console.log("checkCredentials");
            this.http.validateConsumnerLink(data).subscribe(
                (response)=>{
                    console.log(response.json());
                    this.flag =  2;
                },
                (error)=>{
                    console.log("checkCredentials");
                    console.log(error);
                }
            );
        }
    }
    checkOtp(){
        if(this.flag==2){
            var data:any = {};
            data.token = this.token;
            data.otp = this.otp;
            data.ip = this.ip;
            this.http.validateConsumnerOtp(data).subscribe(
                (response)=>{
                    if(response.json().status==1){
                        this.flag = 3;
                        this.http.getCertificatesForRequest(data).subscribe(
                            (response)=>{
                                this.certificates = response.json();
                                console.log(this.certificates);
                            },
                            (error)=>{
                                console.log("error in checkOtp consumer");
                                console.log(error);
                            }
                        );
                    }
                    else{
                        this.flag = 1;
                    }
                },
                (error)=>{

                }
            );
        }
    }

    clear(){
        this.flag = 1;
    }

    downloadCertificate(id,name,type){
        var data:any = {};
        data.token = this.token;
        data.certificateId = id;
        var response = {};
        data.url = this.ip;
        this.http.getCertificate(data).subscribe(
            (response)=>{
                var res:any = response;
                let blob:Blob = response.blob();
                saveAs(blob,name+"."+type);
            },
            (error)=>{
                console.log(error);
                console.log(error)
            }
        );
    }
    viewCertificate(a){
    console.log(a);
    this.http.viewUploadedDoc({token:JSON.parse(localStorage.getItem("login")).token,id:a.certificateIds}).subscribe(
      (response)=>{
              console.log(response);
              var resp:any = response;
              console.log(resp);
              var file = new Blob([resp.json()],{type:'application/pdf'});
                  var fileUrl = URL.createObjectURL(file);
                window.open(fileUrl);
                  },
      (error)=>console.log(error));
  }
    validateCertificate(req){
        console.log("____________________")
        console.log(req)
        this.http.blockChainVerification({
            token:this.token,
            ip:this.ip,
            certificateAddress:req.certificateIds,
            studentAddress:this.studentAddress}).subscribe(
            (response)=>{
                console.log(response.json());
                if(response.json().status > 0){
                    var text = "<i class = 'sli-user'> Student Verified <i class = 'sli-check'></i></br></br>"+
                    "<i class = 'sli-layers'> Batch Verified <i class = 'sli-check'></i></br></br>"+
                    "<i class = 'sli-notebook'> Course Verified <i class = 'sli-check'></i></br></br>"+
                    "<i class = 'sli-chart'> Institution Verified <i class = 'sli-check'></i></br></br>"+
                    "<i class = 'sli-graduation'> University Verified <i class = 'sli-check'></i></br></br>"+
                    "Certificate Hash: </i></br></br>"+
                    response.json().certificate;                    

                    this.http.sendVerificationReport({certificateAddress:req.certificateIds,token:this.token,emailId:this.emailId,blockAddressed:response.json()}).subscribe(
                        (response)=>{
                            if(response.json().status === 1){
                                swal({content:"html",title:"Certificate Verified", html:text, icon:"success"});                                
                            }else{
                                console.log("Failed to send the transaction report")
                            }
                        },
                        (err)=>{
                            console.log(err);
                        })

                }else{
                    swal("Certificate Could not be verified","Certificate reference not found or certificate has been rejected","error");
                }
            },
            (error)=>{
                console.log(error);
                swal("Server Not reachable","check your internet connection","error");
                console.log("error occured");
            }
        );
    }

    isError(element, message) {
        var el = $(element);
        el.parent().removeClass('has-success').addClass('has-danger');
        el.removeClass('form-control-success').addClass('form-control-danger');
        el.next().text(message).removeClass('text-success').addClass('text-danger');
        el.attr('data-valid', false);
    }

    isSuccess(element, message) {
        var el = $(element);
        el.parent().removeClass('has-danger').addClass('has-success');
        el.removeClass('form-control-danger').addClass('form-control-success');
        el.next().text(message).removeClass('text-danger').addClass('text-success');
        el.attr('data-valid', true);
    }

    resetMessages(element) {
        var el = $(element);
        el.parent().removeClass('has-danger').removeClass('has-success');
        el.removeClass('form-control-danger').removeClass('form-control-success');
        el.next().text('');
    }

    validateOnChange(element, rules, successMessage, errorMessage) {
        var self = this;
        $(document).on('focus', element, function(e) {
            e.preventDefault();
            //resetMessages(element);
            return false;
        });
        $(document).on('blur', element, function(e) {
            e.preventDefault();
            var result = approve.value($(element).val(), rules);
            if (result.approved) {
                self.isSuccess(element, successMessage);
            } else {
                self.isError(element, errorMessage);
            }
            return false;
        })
    }
}