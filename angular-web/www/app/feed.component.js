"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var city_service_1 = require('./city.service');
var FeedComponent = (function () {
    function FeedComponent(cityService) {
        this.tweets = [
            { text: 'Test1' },
            { text: 'Test2' },
            { text: 'Test3' }
        ];
        this.cityService = cityService;
        this.data = cityService.getCity(this.cityTo, this.cityFrom);
    }
    FeedComponent.prototype.ngOnInit = function () {
        this.data = this.cityService.getCity(this.cityTo, this.cityFrom);
        console.log(this.cityTo);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], FeedComponent.prototype, "cityTo", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], FeedComponent.prototype, "cityFrom", void 0);
    FeedComponent = __decorate([
        core_1.Component({
            selector: 'feed',
            template: "\n<accordion>\n  <accordion-group *ngFor=\"let tweet of data | async \" heading=\"item\">\n  {{ tweet.text | json}}\n  </accordion-group>\n</accordion>\n",
            providers: [city_service_1.CityService]
        }), 
        __metadata('design:paramtypes', [city_service_1.CityService])
    ], FeedComponent);
    return FeedComponent;
}());
exports.FeedComponent = FeedComponent;
//# sourceMappingURL=feed.component.js.map