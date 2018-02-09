import { Component,OnInit,OnDestroy } from '@angular/core';
import { RestCallsComponent } from '../../services/httpServices';
import { ISubscription } from "rxjs/Subscription";
import { ColorsService } from '../../services/colors';
import { Router } from '@angular/router';
import { DataTransferService } from "../../services/DataTransferService";
import { DataService } from "../../services/DataService";

declare var $: any;
declare var swal: any;
declare var approve: any;

@Component({
	selector:'app-addStudent-Manually',
	templateUrl: './addManually.html',
	providers: [ColorsService]
})

export class AddStudentManually implements OnInit,OnDestroy {
  public aadharPassport:boolean=true;
  public student:any = {};
  public showIfIndia:boolean=true;
  public showIfNotIndia:boolean=true;
  public loginData:any;
  public abc:ISubscription;
  public def:ISubscription;
  public addStudentButton:boolean = true;
  public verifyAadharButton:boolean = true;
  public countries:any = [];
  public batchInfo:any = {};
	constructor(
    private colorsService: ColorsService,
    private rout:Router,
    private rest:RestCallsComponent,
    private transfer:DataTransferService,
    private dataService:DataService) {
    this.batchInfo = this.transfer.getBatch();
	}
	ngOnInit(){
    this.loginData = JSON.parse(localStorage.getItem("login"));
		this.countries = ['Afghanistan','Åland Islands','Albania','Algeria','American Samoa','AndorrA','Angola','Anguilla','Antarctica','Antigua and Barbuda','Argentina','Armenia','Aruba','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bermuda','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Bouvet Island','Brazil','British Indian Ocean Territory','Brunei Darussalam','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Cape Verde','Cayman Islands','Central African Republic','Chad','Chile','China','Christmas Island','Cocos (Keeling) Islands','Colombia','Comoros','Congo','Congo, The Democratic Republic of the','Cook Islands','Costa Rica','Cote D\'Ivoire','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Ethiopia','Falkland Islands (Malvinas)','Faroe Islands','Fiji','Finland','France','French Guiana','French Polynesia','French Southern Territories','Gabon','Gambia','Georgia','Germany','Ghana','Gibraltar','Greece','Greenland','Grenada','Guadeloupe','Guam','Guatemala','Guernsey','Guinea','Guinea-Bissau','Guyana','Haiti','Heard Island and Mcdonald Islands','Holy See (Vatican City State)','Honduras','Hong Kong','Hungary','Iceland','India','Indonesia','Iran, Islamic Republic Of','Iraq','Ireland','Isle of Man','Israel','Italy','Jamaica','Japan','Jersey','Jordan','Kazakhstan','Kenya','Kiribati','Korea, Democratic People\'S Republic of Korea','Kuwait','Kyrgyzstan','Lao People\'S Democratic Republic','Latvia','Lebanon','Lesotho','Liberia','Libyan Arab Jamahiriya','Liechtenstein','Lithuania','Luxembourg','Macao','Macedonia, The Former Yugoslav Republic of','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Martinique','Mauritania','Mauritius','Mayotte','Mexico','Micronesia, Federated States of','Moldova, Republic of','Monaco','Mongolia','Montserrat','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal','Netherlands','Netherlands Antilles','New Caledonia','New Zealand','Nicaragua','Niger','Nigeria','Niue','Norfolk Island','Northern Mariana Islands','Norway','Oman','Pakistan','Palau','Palestinian Territory, Occupied','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Pitcairn','Poland','Portugal','Puerto Rico','Qatar','Reunion','Romania','Russian Federation','RWANDA','Saint Helena','Saint Kitts and Nevis','Saint Lucia','Saint Pierre and Miquelon','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia and Montenegro','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Georgia and the South Sandwich Islands','Spain','Sri Lanka','Sudan','Suriname','Svalbard and Jan Mayen','Swaziland','Sweden','Switzerland','Syrian Arab Republic','Taiwan, Province of China','Tajikistan','Tanzania, United Republic of','Thailand','Timor-Leste','Togo','Tokelau','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Turks and Caicos Islands','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','United States Minor Outlying Islands','Uruguay','Uzbekistan','Vanuatu','Venezuela','Viet Nam','Virgin Islands, British','Virgin Islands, U.S.','Wallis and Futuna','Western Sahara','Yemen','Zambia','Zimbabwe'];	    
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
    $('#date-picker-2').datepicker({
      orientation: 'bottom'
    });
    $('#date-picker-2').on('changeDate', function() {
      let val = $('#date-picker-2').datepicker('getFormattedDate');
      console.log('date: ', val);
    });
    $('#date-picker-3').datepicker({
      orientation: 'bottom'
    });
    $('#date-picker-3').on('changeDate', function() {
      let val = $('#date-picker-3').datepicker('getFormattedDate');
      console.log('date: ', val);
    });
	    //firstname
	    this.validateOnChange('#studentName-0', {
	      title: 'Student Name',
	      required: true
	    }, '', '');
	    //lastname
	    this.validateOnChange('#studentFather-0', {
	      title: 'Student Father name',
	      required: true
	    }, '', '');
	    //email
	    this.validateOnChange('#phoneNumber-0', {
	      title: 'Contact Number',
	      numeric: true,
	      range: {
	        min: 10,
	        max: 12
	      }
	    }, '', 'Please enter a valid contact number having 10-12  characters');
	    
	    this.validateOnChange('#rollNumber-0', {
	      title: 'Roll Number',
	    }, '', '');

	    this.validateOnChange('#emailId-0', {
	      title: 'Email Id',
	      email: true
	    }, '', '');
	    	    this.validateOnChange('#password-0', {
	      title: 'Password',
	      required: true
	    }, '', '');
	    this.validateOnChange('#address-1', {
	      title: 'Address',
	      required: true
	    }, '', '');
	    //degree level
	    this.validateOnChange('#city-1', {
	      title: 'City',
	      required: true
	    }, '', '');
	    //country
	    this.validateOnChange('#state-1', {
	      title: 'State',
	      required: true
	    }, '', '');
	    //language
	    this.validateOnChange('#nationality-1', {
	      title: 'Nationality',
	      required: true
	    }, '', '');

	    this.validateOnChange('#pinCode-1', {
	      title: 'Pin Code',
	      numeric: true,
	      required: true,
        range: {
          min: 6,
          max: 6
        }
	    }, '', '');
	    $('.go-back').on('click', function(e) {
      e.preventDefault();
      var target = $(this).attr('data-target');
      $(target).trigger('click');
      return false;
    });
    $('#step-0').submit(function(e) {
      e.preventDefault();
      var fields = [];
      $('#step-0 .form-control').each(function() {
        $(this).focus().blur();
        fields.push($(this).attr('data-valid') === "true" ? true : false);
      });
      if (fields.includes(false)) {
        $('#steps .tab-0').trigger('click');
        $('#steps .tab-1').addClass('disabled');
        $('#steps .tab-2').addClass('disabled');
        return false;
      }
      $('#steps .tab-1').removeClass('disabled').trigger('click');
      $('#steps .tab-2').addClass('disabled');
      return false;
    });
    $('#step-1').submit(function(e) {
      e.preventDefault();
      var fields = [];
      $('#step-1 .form-control').each(function() {
        $(this).focus().blur();
        fields.push($(this).attr('data-valid') === "true" ? true : false);
      });
      if (fields.includes(false)) {
        $('#steps .tab-1').trigger('click');
        $('#steps .tab-2').addClass('disabled');
        return false;
      }
      $('#steps .tab-2').removeClass('disabled').trigger('click');
      return false;
    });
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
  nationalitySelected(event){
  	console.log("nationalitySelected:");
  	console.log(event);
  	this.aadharPassport = false;
    this.student.nationality = event;
  	if(event === "India"){
      this.verifyAadharButton = false;
      this.addStudentButton =true;
  		this.showIfIndia = true;
  	}else{
      if(this.verifyAadharButton === false){
        this.verifyAadharButton = true;
      }
      this.addStudentButton =false;
  		this.showIfIndia = false;
  	}

  }
  verifyAadhar(student){
    console.log("verifyAadhar");
    console.log(student);
    var aadharQuery = {
          student:student,
          token:this.loginData.token
        };
      this.rest.verifyAadharForStudent(aadharQuery).subscribe(
      (response)=>{
        if(response.json().aadharResponse.auth===true){
          this.addStudentButton = false;
      }},
      (error)=>{console.log(error)});
  }
  SubmitUniversity(student){
  swal({
    title: 'Create Student',
    text: 'A new student: '+student.name+' will be created!',
    type: "info",
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, create it!',
    cancelButtonText: 'No!',
    confirmButtonClass: 'confirm-class',
    cancelButtonClass: 'cancel-class',
    closeOnConfirm: true,
    closeOnCancel: true,
  },  function(isConfirm) {
        if (isConfirm) {
            console.log(student);
            var query = {
              student:student,
              token:this.loginData.token,
              university:{
                universityId:this.loginData.universityId,
                universityName:this.dataService.getUniversityData().universityName
              },
              institution:{
                institutionId:this.batchInfo.institutionId,
                institutionName:this.batchInfo.instituteName,
                enrolmentDate:this.batchInfo.year,
                courseName:this.batchInfo.courseName,
                specialization:this.batchInfo.stream,
                batchId:this.batchInfo._id
              },
              batchInfo:this.batchInfo,
              batchAddress:this.batchInfo.batchAddress
            };
            console.log(query);
            this.rest.updateStudentCountInBatch(query).subscribe(
              (response)=>{
                if(response.json().status === 1){
                    this.def = this.rest.addStudent(query).subscribe(
                    (response)=>{console.log("added Successfully");
                      this.rout.navigate(['view/StudentBatches'])
                    },
                    (error)=>console.log(error));                
                }},
                (error)=>{
                  console.log(error);
                }
              )
              } else {
            swal("Cancelled", "No Course Added:)", "error");
        }
    }.bind(this));
}
    foreignSelected(){
      this.addStudentButton = false;
      console.log("khkghj");
    }
  ngOnDestroy(){
    if(this.abc){
      this.abc.unsubscribe();
    }
    if (this.def) {
      this.def.unsubscribe();
    }
  }
  validateOnChange(element, rules, successMessage, errorMessage) {
    var self = this;
    $(document).on('focus', element, function(e) {
      e.preventDefault();
      return false;
    });
    $(document).on('blur', element, function(e) {
      e.preventDefault();
      var result = approve.value($(element).val(), rules);
      if (result.approved) {
        self.isSuccess(element, successMessage);
        console.log('Self: '+ self);
      } else {
        self.isError(element, errorMessage);
        console.log('Self: '+ self);
      }
      return false;
    })
  }
}