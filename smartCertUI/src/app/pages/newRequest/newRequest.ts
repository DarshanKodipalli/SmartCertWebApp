import { Component , OnInit } from '@angular/core';
import { HttpService } from '../../services/HttpService';
import { Router } from "@angular/router";

declare var $: any;
declare var swal: any;
declare var approve: any;

@Component({
  selector: 'new-request',
  templateUrl: './newRequest.html'
})

export class NewRequestComponent implements OnInit  {
  public emailId:String = "";
  public phoneNumber:String = "";
  public certificates:any = [];
  public count:number = 0;
  public viewLimit:number = 0;
  public expiryDate:Date = new Date(Date.now());
  public purpose:any = [];
  public request:any = {};
  constructor(private http:HttpService,private router:Router) {
    this.http.getCertificates(JSON.parse(localStorage.getItem("login"))).
    subscribe(
      (response)=>{
        if(!response.json().status)
          this.certificates = response.json();
        else{
          if(response.json().status === -2){
            
          }
        }
      },
      (error)=>{
        console.log(error);
        console.log("new request constructor");
      });
  }

  ngOnInit() {
        this.purpose = [
              'For Central/State Government',
              'For Private Companies/Employers',
              'Government Login',
              'Others'
              ];
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
    this.validateOnChange('#name', {
      title: 'Name',
      required: true,
    },"Name is valid","Please enter a valid Name");
    this.validateOnChange('#email', {
      title: 'Email',
      required: true,
      email:true,
    },"Email is valid","Please enter a valid email Id");
    this.validateOnChange("#phone", {
      title:"Phone",
      required : false,
    },"Phone number is valid","Enter a valid Phone number");
    this.validateOnChange("#limit", {
      title:"View Limit",
      required : false,
    },"","");
    this.validateOnChange("#purpose", {
      title:"Purpose",
      required : false,
    },"","");
    this.validateOnChange("#expiryDate", {
      title:"Expiry Date",
      required : false,
    },"valid date","invalid date");
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

  newRequest(request){
      swal({
        title: 'Share Documents',
        text: 'Share Documents to '+ request.sharedToName +' ?',
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
                var login = JSON.parse(localStorage.getItem("login"));
                var data:any = {};
                var flag = false;
                console.log("In NEWREQUEST");
                data.token = login.token;
                request.certificates = [];
                request.educationalDetails = [];
                this.request.certificates = [];
                var university = "";
                for (var i = 0; i < this.certificates.length; ++i) {
                  if(this.certificates[i].flag){
                    if(!this.request.certificates.length){
                      university = this.certificates[i].universityId;
                      data.ip = this.certificates[i].proof+"/";
                      flag = true;
                    }
                    if(university!==this.certificates[i].universityId){
                      flag  = false;
                      break;
                    }
                    this.request.educationalDetails.push({
                      institutionId:this.certificates[i].institutionId,
                      institutionName:this.certificates[i].institutionName
                    })
                    this.request.certificates.push({
                      certificateIds:this.certificates[i].certificateHashkey,
                      certificateName:this.certificates[i].certificateName,
                      fileType:this.certificates[i].fileType,
                      validateToken:this.certificates[i].verificationToken
                    });
                  }
                }
                console.log(data.ip);
                this.request.studentName = JSON.parse(localStorage.getItem("login")).name;
                data.request = this.request;
                if(flag){
                  this.http.createRequest(data).subscribe(
                    (response)=>{
                      console.log("NewRequestComponent");
                      console.log(response.json());
                      this.router.navigate(['/']);
                    },
                    (err)=>{
                      console.log(err);
                      console.log("new request controller");

                    });
                }else{
                  alert("please select certificates of a single university for a request");
                }
            } else {
                swal("Cancelled", "No Certificate Added:)", "error");
            }
        }.bind(this));
  }

  addCert(data){
    if(data.flag){
      data.flag = false;
      this.count--;
    }
    else{
      this.count++;
      data.flag = true;
    }
  }

  validate(){
    if(this.count > 0 ){
      var fields = [];
      $('#request .form-control').each(function() {
        $(this).focus().blur();
        fields.push($(this).attr('data-valid') === "true" ? true : false);
      });
      if (fields.includes(false)) {
        return false;
      }
      else{
        return true;
      }
    }
    else
      return false;
  }

}