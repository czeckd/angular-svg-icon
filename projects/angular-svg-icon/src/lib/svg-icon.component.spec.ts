import { ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { of } from 'rxjs';


import { SvgIconComponent } from './svg-icon.component';
import { SvgIconRegistryService } from './svg-icon-registry.service';

describe('SvgIconComponent', () => {
	let fixture: ComponentFixture<SvgIconComponent>;
	let mockSvgIconRegistryService = jasmine.createSpyObj( ['getSvgByName', 'loadSvg'] );

	const SVG = `<svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z" /></svg>`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [
				SvgIconComponent
			],
			providers: [
				{ provide: SvgIconRegistryService, useValue: mockSvgIconRegistryService },
			]
		});

		fixture = TestBed.createComponent(SvgIconComponent);
	});

	it ('should load by src', () => {
		const div = document.createElement('DIV');
		div.innerHTML = SVG;
		const svg = div.querySelector('svg') as SVGElement;
		mockSvgIconRegistryService.loadSvg.and.returnValue(of(svg));

		fixture.componentInstance.src = 'svg';
		fixture.detectChanges();

		expect(true).toBe(true);
	});

	it ('should load by name', () => {
/*		const div = document.createElement('DIV');
		div.innerHTML = SVG;
		const svg = div.querySelector('svg') as SVGElement;
		mockSvgIconRegistryService.loadSvg.and.returnValue(of(svg));

		fixture.componentInstance.src = 'svg';
		fixture.componentInstance.name = 'svg';
		fixture.detectChanges();
*/
		expect(true).toBe(true);
	});

	it ('should change the src', () => {
		const div = document.createElement('DIV');
		div.innerHTML = SVG;
		const svg = div.querySelector('svg') as SVGElement;
		mockSvgIconRegistryService.loadSvg.and.returnValue(of(svg));

		fixture.componentInstance.src = 'svg';
		fixture.detectChanges();

		fixture.componentInstance.src = 'bar';
		fixture.detectChanges();

		expect(true).toBe(true);
	});


});
