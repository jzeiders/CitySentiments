import { Injectable } from '@angular/core';
import {AngularFire, FirebaseListObservable} from 'angularFire2';

@Injectable()
export class CityService {
	data: FirebaseListObservable<any>
	af: any;
	constructor(af: AngularFire) {
		this.af = af;
	}
	getCity(cityTo: string, cityFrom: string) {
    console.log("THIS" + cityTo + cityFrom);
		return this.af.database.list('/rawData/' + cityFrom +"/" + cityTo);
	};

};
