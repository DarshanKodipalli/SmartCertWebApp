import { Component, OnInit } from '@angular/core';
import { ColorsService } from '../services/colors';
import { RestCallsComponent } from '../services/httpServices';
import { Router } from '@angular/router';
import { NotificationService } from "../services/notificatationService";
import { DataTransferService } from "../services/dataTransferService";

declare var $: any;
declare var swal: any;
declare var approve: any;
declare var httpCall: RestCallsComponent;

@Component({
  selector: 'edit-institute',
  templateUrl: './edit-institute.html',
  providers: [ColorsService]
})

export class EditInstituteComponent implements OnInit {

  public institute:any = {};
  public unchanged:any = {};
  public myvar=false;
  public myvar1=false;

  constructor(private colorsService: ColorsService, 
              private httpCalls: RestCallsComponent, 
              private route: Router,
              private transfer:DataTransferService,
              private notify:NotificationService) {
    this.unchanged = this.transfer.getInstitute();
  }

  editInstitute(insti) {
    console.log("sending Http Calls");
    var temp = this.transfer.getInstitute();
    insti.instituteNumber = temp.instituteNumber;
    insti.name = temp.instituteName;
    insti.id = temp._id;
    this.httpCalls.editInstitute(insti).subscribe(
      (response) => {
        var temp = response.json();
        if(temp.status == -1)
          this.notify.errorNotification();
        else if(temp.status == -2)
          this.notify.loginNotification();
        else
            {
                this.transfer.setUniversity(this.transfer.getUniversity())
                this.route.navigate(['university/view-institutes-component']);
            }
      },
      (error) => console.log(error));
  }

SubmitInstitute(instit): void {
swal({
  title: 'Update Institute',
  text: 'All the details for the institute '+localStorage.getItem('instituteName')+' will be updated!',
  type: "info",
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes, update it!',
  cancelButtonText: 'No!',
  confirmButtonClass: 'confirm-class',
  cancelButtonClass: 'cancel-class',
  closeOnConfirm: false,
  closeOnCancel: false,
},  function(isConfirm) {
      if (isConfirm) {
          swal({
              title: 'Success!',
              text: 'Institute details updated!',
              confirmButtonText: 'Ok!',
              closeOnConfirm: true
          }, function() {
            this.editInstitute(instit);
          }.bind(this));

      } else {
          swal("Cancelled", "Update cancelled", "error");
      }
  }.bind(this));
};

cancelProcess(): void {
swal({
  title: 'Do you want to cancel?',
  text: 'All the changes will be reverted!',
  type: "warning",
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes, cancel it!',
  cancelButtonText: 'No!',
  confirmButtonClass: 'confirm-class',
  cancelButtonClass: 'cancel-class',
  closeOnConfirm: false,
  closeOnCancel: false,
},  function(isConfirm) {
      if (isConfirm) {
          swal({
              title: 'Changes reverted!',
              text: 'Redirecting back to home...',
              timer: 2000,
              showConfirmButton: false
          }, function() {
              this.transfer.setUniversity(this.transfer.getUniversity())
              this.route.navigate(['university/view-institutes-component']);
          }.bind(this));

      } else {
          swal("Cancelled", "Cancellation averted!", "error");
      }
  }.bind(this));
};

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
    //firstname
    this.validateOnChange('#instituteName-0', {
      title: 'Institute Name',
      required: true
    }, 'Institute Name is valid', 'Please enter a valid Institute Name');
    //lastname
    this.validateOnChange('#instituteNumber-0', {
      title: 'Institute Number',
      required: true
    }, 'Institute Number is valid', 'Please enter a valid Institute Number');
    //email
    this.validateOnChange('#contactPerson-0', {
      title: 'Contact Person',
      required: true
    }, 'Contact Person is valid', 'Please enter a valid Contact Person');
    //age
    this.validateOnChange('#contactNumber-0', {
      title: 'Contact Number',
      numeric: false,
      range: {
        min: 10,
        max: 12
      }
    }, 'Contact Number is valid', 'Please enter a valid Contact Number having 10-12 characters');

    this.validateOnChange('#designation-0', {
      title: 'Designation',
      required: true
    }, 'Designation Entered', 'Please enter a valid Designation');

    this.validateOnChange('#emailId-0', {
      title: 'Email Id',
      email: true
    }, 'Email Id is valid', 'Enter a valid email id');
    //
    this.validateOnChange('#password-0', {
      title: 'Password',
      required: true
    }, 'Password provided! Re-enter to confirm', 'Please enter some text');

    this.validateOnChange('#address-1', {
      title: 'Address',
      required: true
    }, 'Address is valid', 'Please enter a valid address');
    //degree level
    this.validateOnChange('#city-1', {
      title: 'City',
      required: true
    }, 'City is valid', 'Please enter a City');
    //country
    this.validateOnChange('#state-1', {
      title: 'State',
      required: true
    }, 'State is valid', 'Please enter a valid State');
    //language
    this.validateOnChange('#pinCode-1', {
      title: 'Pin Code',
      numeric: true,
      required: true
    }, 'Pin Code is valid', 'Please enter the Pin Code');

    $('#go-back').on('click', function(e) {
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
      this.myvar=true;
      $('#steps .tab-1').removeClass('disabled').trigger('click');
      $('#steps .tab-2').addClass('disabled');
      return false;
    }.bind(this));
    $('#step-1').submit(function(e) {
      e.preventDefault();
      var fields = [];
      $('#step-1 .form-control').each(function() {
        $(this).focus().blur();
        fields.push($(this).attr('data-valid') === "true" ? true : false);
      });
      this.myvar1=true;
      if (fields.includes(false)) {
        $('#steps .tab-1').trigger('click');
        $('#steps .tab-2').addClass('disabled');
        return false;
      }
      $('#steps .tab-2').removeClass('disabled').trigger('click');
      return false;
    }.bind(this));
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
        console.log('Self: '+ self);
      } else {
        self.isError(element, errorMessage);
        console.log('Self: '+ self);
      }
      return false;
    })
  }
}
