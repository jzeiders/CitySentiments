import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent }   from './app.component';
import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { AngularFireModule } from 'angularFire2';

import { FeedComponent } from './feed.component';

export const firebaseConfig = {
  	apiKey: "AIzaSyB6B8bcFMZ9cO5kvx4PEexvOf7zCo2mXzc",
  	authDomain: "citysentiment.firebaseapp.com",
  	databaseURL: "https://citysentiment.firebaseio.com",
  	storageBucket: "citysentiment.appspot.com",
};
@NgModule({
	imports: [BrowserModule,
		Ng2BootstrapModule,
    AngularFireModule.initializeApp(firebaseConfig)

	],
	declarations: [
		AppComponent,
		FeedComponent],
	bootstrap: [AppComponent]
})
export class AppModule { }
