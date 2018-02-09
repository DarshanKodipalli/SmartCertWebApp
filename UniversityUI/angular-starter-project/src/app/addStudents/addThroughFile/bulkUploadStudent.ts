import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { RestCallsComponent } from '../../services/httpServices';

@Component({
    selector: 'bulk-upload-student',
    template:'  <label style="color:black" for="files" class="btn">Choose Docment</label>  <input type="file" id="files" style="visibility:hidden;" #fileInput >'
/*    template: '<input type="file" [multiple]="multiple" #fileInput>'*/
})
export class BulkUploadComponentStudent {
    @Input() multiple: boolean = false;
    @ViewChild('fileInput') inputEl: ElementRef;

    constructor(private http: RestCallsComponent) {}

    upload() {
        console.log("________________Certificate Data_________________________")
        let inputEl: HTMLInputElement = this.inputEl.nativeElement;
        let fileCount: number = inputEl.files.length;
        var formData = new FormData();
        if (fileCount > 0) {
            for (let i = 0; i < fileCount; i++) {
                formData.append('files', inputEl.files.item(i));
            }
            console.log("_____________________________");
            console.log(formData);
        this.http.setStudentTemp(formData);
        }
    }
}