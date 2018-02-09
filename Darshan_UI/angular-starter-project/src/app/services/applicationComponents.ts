import { Injectable } from '@angular/core';

@Injectable()

export class ApplicationComponents{
	constructor(){
	}
	getUrlAndPort(){
		return "http://"+location.hostname+":"+3003;
	}
}