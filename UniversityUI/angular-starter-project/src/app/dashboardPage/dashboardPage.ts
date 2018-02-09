import { Component,OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../services/httpServices';
import { Router} from '@angular/router'
import { ColorsService } from '../services/colors';

declare var $: any;
declare var Morris: any;
declare var Datamap: any;

@Component({
  selector: 'dashboardPage',
  templateUrl: "../dashboardPage/dashboardPage.html", 
  providers: [ColorsService]
})

export class DashboardPageComponent implements OnInit {

  public certificatesToBeSigned:any=[];
  public batchesCount:number=0;
  public numberOfCertificates:number=0;
  public showBatchTable:boolean = false;
  public colors : Object;
  public receivedData:any = [];
  public graphDataCreatedOn:any = [];
  public graphData:any = [];
  public numberOfVerifiedCertificates:number=0;
  public showTable:boolean = true;
  constructor(private http:RestCallsComponent,private colorsService: ColorsService,private route:Router) {
    this.colors = colorsService.getBootstrapColors();  
        var abc = this.http.getAllVerifiedCertificates({token:JSON.parse(localStorage.getItem("login")).token}).subscribe(
        (response)=>{
                      console.log("Response")
                      console.log(response.json().length);
                      this.numberOfVerifiedCertificates = response.json().length;
                      console.log(this.numberOfVerifiedCertificates);
                      this.http.getAllBatchesVerified({token:JSON.parse(localStorage.getItem("login")).token}).subscribe(
                            (response)=>{
                                          //console.log(response.json())
                                          this.certificatesToBeSigned = response.json();
                                          this.batchesCount = response.json().length;
                                          if(this.batchesCount>0){
                                            this.showTable = false;
                                            for(var i=0;i<this.batchesCount;i++){
                                              //if(this.certificatesToBeSigned[i].rejectedCount===0)
                                              this.numberOfCertificates+=this.certificatesToBeSigned[i].rejectedCount;
                                              //console.log("_____________________certificateCount_____________");
                                              //console.log(this.numberOfCertificates);
                                              if(this.numberOfCertificates===NaN){
                                                this.numberOfCertificates = 0;
                                              }
                                              //console.log(this.batchesCount + " "+ this.numberOfCertificates)
                                            }                      
                                          }else{
                                            this.showBatchTable =true;
                                          }
                                        },
                            (error)=>console.log(error));

                    },
        (error)=>console.log(error));    
  }
  ngOnInit(){
this.graphData = [{
        t: 'January',
        r: 100
      }, {
        t: 'February',
        r: 75
      }, {
        t: '2008',
        r: 50
      }, {
        t: '2009',
        r: 75
      }, {
        t: '2010',
        r: 50
      }, {
        t: '2011',
        r: 75
      }, {
        t: '2012',
        r: 100
      }]
    this.morrisBar('bar-chart-3', this.colors);

    let self = this;
    let onResizeEnd = () => {
      $('body').trigger('changed:background');Router
    }

    setInterval(function() {
      var index = Math.floor(Math.random() * 6);
      $('.table-widget-1 tr').each(function(i, v) {
        var td = $('td:nth-child(3)', $(this));
        var value = td.text().trim();
        var random = Math.floor(Math.random() * 1000);
        td.css({ 'font-weight': 500 })
        if (i === index) {
          td.text(random);
          td.css({ 'font-weight': 700 })
        }
      });
      $('.table-widget-1 tr').each(function(i, v) {
        var td = $('td:nth-child(4)', $(this));
        var value = parseInt(td.text().trim());
        var random = Math.floor(Math.random() * 100);
        td.css({ 'font-weight': 500 })
        if (i === index) {
          td.text(random + '%');
          td.css({ 'font-weight': 700 })
        }
      });
    }, 1000);


    let resizeTimeout;
    $(window).on('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(onResizeEnd, 500);
    });

    $('body').on('toggle:collapsed', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(onResizeEnd, 500);
    })
    //console.log("Id:");
  }
  morrisBar(element: string, colors: any): void {
   this.http.certificateApprovalMonthWise({token:JSON.parse(localStorage.getItem("login")).token}).subscribe(
     (response)=>{
       var month_name = function(month){
         var monthList = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
         return monthList[month];
       }
       console.log("*(*(*(*(*(*()*)*)*)*)*)*"); 
//       //console.log(response.json());
       this.receivedData = response.json();
       for(var i=0;i<this.receivedData.length;i++){
         var temp:any ={};
         temp.r = this.receivedData[i].certificateCount;              // created count
//        temp.r = 50;
         temp.t = month_name(this.receivedData[i].month[0].month-1);  // Month Name
         this.graphDataCreatedOn.push(temp);
       }
       console.log(this.graphDataCreatedOn);
       console.log(this.graphData);
       console.log("*&*&*&*&*&*&*&*&*&*&*&*&");
     },
     (error)=>{
       //console.log(error);
     })
     const chart = Morris.Bar({
      element: element,
      data: this.graphDataCreatedOn,
      xkey: 't',
      ykeys: ['r'],
      labels: ['Series A'],
      barColors: [this.colors['success']],
    });
    $(window).resize(function() {
      chart.redraw();
    });
  }
}