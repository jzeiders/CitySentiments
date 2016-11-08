import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
  <h1>My First Angular Apps</h1>
  <table>
  <tr>
    <td> <feed [cityTo]="'Los Angeles'" [cityFrom]="'Chicago'"> </feed></td>
    <td> <feed [cityTo]="'Chicago'" [cityFrom]="'Los Angeles'"> </feed></td>
  </tr>
  </table>
  `
})
export class AppComponent { }
