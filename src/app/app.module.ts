import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SvgIconComponent, provideAngularSvgIcon } from 'angular-svg-icon';
import { DemoAppComponent } from './demo-app.component';

@NgModule({
	imports:         [ BrowserModule, FormsModule, HttpClientModule, SvgIconComponent ],
	declarations:    [ DemoAppComponent ],
	providers: 		 [ provideAngularSvgIcon() ],
	bootstrap:       [ DemoAppComponent ]

})
export class AppModule {}
