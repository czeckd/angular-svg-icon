import { provideHttpClient } from '@angular/common/http';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { SvgIconComponent, provideAngularSvgIcon } from 'angular-svg-icon';
import { DemoAppComponent } from './app/demo-app.component';

enableProdMode();

bootstrapApplication(DemoAppComponent, {
    providers: [
        importProvidersFrom(SvgIconComponent),
        provideAngularSvgIcon(),
        provideHttpClient()
    ]
});
