import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { of } from 'rxjs';

import { SvgLoader } from './svg-loader';
import { SERVER_URL, SvgIconRegistryService } from './svg-icon-registry.service';

describe('SvgIconRegistryService', () => {
	let service: SvgIconRegistryService;
	const mockSvgLoader = jasmine.createSpyObj( ['getSvg'] );
	const serverUrl = 'localhost';
	let document: Document;

	const SVG = `<svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z" /></svg>`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: SvgLoader, useValue: mockSvgLoader },
				{ provide: SERVER_URL, useValue: serverUrl },
				SvgIconRegistryService
			]
		});

		service = TestBed.inject(SvgIconRegistryService);
		document = TestBed.inject(DOCUMENT);

	});

	it ('should add svg that does not exist', () => {
		const div = document.createElement('DIV');
		div.innerHTML = SVG;
		const svg = div.querySelector('svg') as SVGElement;

		service.addSvg('svg', SVG);

		service.getSvgByName('svg')?.subscribe(data => {
			expect(data).toEqual(svg);
		});

	});

	it ('should load svg by url', () => {
		const div = document.createElement('DIV');
		div.innerHTML = SVG;
		const svg = div.querySelector('svg') as SVGElement;
		mockSvgLoader.getSvg.and.returnValue(of(SVG));

		service.loadSvg('http://svg')?.subscribe(data => {
			expect(data).toEqual(svg);
		});
	});

	it ('should load svg only once', () => {
		mockSvgLoader.getSvg.and.returnValue(of(SVG));
		mockSvgLoader.getSvg.calls.reset();

		service.loadSvg('svg')?.subscribe(data => {});
		service.loadSvg('svg')?.subscribe(data => {});

		expect(mockSvgLoader.getSvg).toHaveBeenCalledTimes(1);
	});

	it ('should load svg by url and assign name', () => {
		const div = document.createElement('DIV');
		div.innerHTML = SVG;
		const svg = div.querySelector('svg') as SVGElement;
		mockSvgLoader.getSvg.and.returnValue(of(SVG));

		service.loadSvg('svg', 'sample')?.subscribe(data => {});

		service.getSvgByName(serverUrl + 'svg')?.subscribe(data => {
			expect(data).toEqual(svg);
		});
	});

	it ('should remove svg', () => {
		service.addSvg('svg', SVG);

		service.unloadSvg('svg');

		service.getSvgByName('svg')?.subscribe({
			error: (err) =>
				expect(err).toBe(`No svg with name 'svg' has been loaded`)
		});
	});

});
