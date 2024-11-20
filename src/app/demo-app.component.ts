import { Component, signal, computed } from '@angular/core';

import { SvgIconRegistryService, SvgIconComponent } from 'angular-svg-icon';
import { NgClass, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
    imports: [SvgIconComponent, FormsModule, NgClass, JsonPipe],
    selector: 'app-demo',
    styleUrls: ['./demo-app.component.scss'],
    templateUrl: './demo-app.component.html'
})

export class DemoAppComponent {
	r = signal(120);
	g = signal(120);
	b = signal(120);
	w = signal(175);
	h = signal(175);
	p = signal(0);
	m = signal(0);
	o = signal(1.0);

	autoheight = signal(true);
	autowidth = signal(false);
	stretch = false;
	border = signal(false);
	display = true;
	klasses = [ '', 'red', 'green', 'blue' ];
	klass = this.klasses[0];
	svgKlasses = [ '', 'small', 'medium', 'large' ];
	svgKlass = this.svgKlasses[0];;
	applied = false;


	img = [ 'assets/images/eye.svg', 'assets/images/moon-o.svg' ];
	onImg = 0;
	message = '';

	getNgStyle = computed(() => {
		const style: any = {};

		if (!this.autoheight()) {
			style['height.px'] = this.h();
		}

		if (!this.autowidth()) {
			style['width.px'] = this.w();
		}

		style.fill = 'rgb(' + this.r() + ',' + this.g() + ',' + this.b() + ')';

		if (this.border()) {
			style.border = '1px solid black';
		}

		if (this.p() > 0) {
			style['padding.px'] = this.p();
		}

		if (this.m() > 0) {
			style['margin.px'] = this.m();
		}

		if (this.o() < 1.0) {
			style.opacity = this.o();
		}

		return style;
	});

	constructor(private registry: SvgIconRegistryService) {
	}

	getStyle(): string {
		return JSON.stringify(this.getNgStyle()).replace(/\"/g, '\'');
	}

	unload(url: string) {
		if (this.display) {
			this.display = false;
			this.registry.unloadSvg(url);

			setTimeout( () => {
				this.message = '';
			}, 2000);

			this.message = url + ' unloaded';

		} else {
			this.display = true;
		}
	}

	swapImg() {
		this.onImg = (this.onImg === 1 ? 0 : 1);
		this.display = true;
	}
}
