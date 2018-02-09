import { Injectable } from '@angular/core';

@Injectable()

export class DataTransferService{
	id:any = {};
	university:any = {};
	institute:any = {};
	user:any = {}
	universityForApprover:any = {}
	universityForIssuer:any = {}
	universityForCreator:any = {}
	constructor(){

	}
	public getId(){
		return this.id;
	}
	public setId(id){
		this.id = id;
	}
	public getUniversity(){
		return this.university;
	}
	public setUniversity(university){
		this.university = university;
	}
	public getInstitute(){
		return this.institute;
	}
	public setInstitute(institute){
		this.institute = institute;
	}
	public getUser(){
		return this.id;
	}
	public setUser(user){
		this.user = user;
	}
	public setUniversityForApprover(university){
		this.universityForApprover = university;
	}
	public getUniversityForApprover(){
		return this.universityForApprover;
	}
	public setUniversityForIssuer(university){
		this.universityForIssuer = university;
	}
	public getUniversityForIssuer(){
		return this.universityForIssuer;
	}
	public setUniversityForCreator(university){
		this.universityForCreator = university;
	}
	public getUniversityForCreator(){
		return this.universityForCreator;
	}
}
