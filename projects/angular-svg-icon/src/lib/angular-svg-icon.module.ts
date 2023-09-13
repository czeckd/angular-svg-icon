import { ModuleWithProviders, NgModule, Provider, makeEnvironmentProviders } from '@angular/core';

import { SVG_ICON_REGISTRY_PROVIDER } from './svg-icon-registry.service';
import { SvgIconComponent } from './svg-icon.component';
import { SvgHttpLoader, SvgLoader } from './svg-loader';

export interface AngularSvgIconConfig {
	loader?: Provider;
}

export function provideAngularSvgIcon(config: AngularSvgIconConfig = {}) {
	return makeEnvironmentProviders([
	  SVG_ICON_REGISTRY_PROVIDER,
	  config.loader || { provide: SvgLoader, useClass: SvgHttpLoader },
	]);
}

@NgModule({
	imports: [
		SvgIconComponent
	],
	exports: [ SvgIconComponent ]
})
export class AngularSvgIconModule {

	static forRoot(config: AngularSvgIconConfig = {}): ModuleWithProviders<AngularSvgIconModule> {
		return {
			ngModule: AngularSvgIconModule,
			providers: [
				SVG_ICON_REGISTRY_PROVIDER,
				config.loader || { provide: SvgLoader, useClass: SvgHttpLoader }
			]
		};
	}
}
