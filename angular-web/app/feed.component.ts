import { Component, Input } from '@angular/core';
import { AccordionModule } from 'ng2-bootstrap/ng2-bootstrap';
import { CityService } from './city.service';

@Component({
	selector: 'feed',
	template: `
<accordion>
  <accordion-group *ngFor="let tweet of data | async " heading="item">
  {{ tweet.text | json}}
  </accordion-group>
</accordion>
`,
	providers: [CityService]
})
export class FeedComponent {
	@Input() cityTo: string;
	@Input() cityFrom: string;
	data: any;
	cityService: CityService;
	constructor(cityService: CityService) {
		this.cityService = cityService;
		this.data = cityService.getCity(this.cityTo, this.cityFrom);
	}
	ngOnInit() {
		this.data = this.cityService.getCity(this.cityTo, this.cityFrom);
		console.log(this.cityTo)
	}

	public tweets: Array<any> = [
		{ text: 'Test1' },
		{ text: 'Test2' },
		{ text: 'Test3' }
	];
}
