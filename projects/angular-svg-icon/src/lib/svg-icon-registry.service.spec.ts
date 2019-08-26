import { Inject, Optional, PLATFORM_ID } from '@angular/core';
import { TestBed, getTestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { of } from 'rxjs';

import { SvgLoader } from './svg-loader';
import { SvgIconRegistryService } from './svg-icon-registry.service';

describe('SvgIconRegistryService', () => {
	let service: SvgIconRegistryService;
	let mockSvgLoader = jasmine.createSpyObj( ['getSvg'] );
	let serverUrl: string = 'localhost';
	let document: Document;

	const SVG = `<svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z" /></svg>`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: SvgLoader, useValue: mockSvgLoader },
				{ provide: PLATFORM_ID, useValue: 'browser' }
			]
		});

		document = TestBed.get(DOCUMENT);

	});

	it ('should add svg that does not exist', () => {
		service = new SvgIconRegistryService(mockSvgLoader, PLATFORM_ID, serverUrl, document);
		const div = document.createElement('DIV');
		div.innerHTML = SVG;
		const svg = div.querySelector('svg') as SVGElement;

		service.addSvg('svg', SVG);

		service.getSvgByName('svg').subscribe(data => {
			expect(data).toEqual(svg);
		});

	});

	it ('should load svg by url', () => {
		service = new SvgIconRegistryService(mockSvgLoader, PLATFORM_ID, serverUrl, document);
		const div = document.createElement('DIV');
		div.innerHTML = SVG;
		const svg = div.querySelector('svg') as SVGElement;
		mockSvgLoader.getSvg.and.returnValue(of(SVG));

		service.loadSvg('http://svg').subscribe(data => {
			expect(data).toEqual(svg);
		});
	});

	it ('should load svg only once', () => {
		service = new SvgIconRegistryService(mockSvgLoader, PLATFORM_ID, serverUrl, document);
		mockSvgLoader.getSvg.and.returnValue(of(SVG));
		mockSvgLoader.getSvg.calls.reset();

		service.loadSvg('svg').subscribe(data => {});
		service.loadSvg('svg').subscribe(data => {});

		expect(mockSvgLoader.getSvg).toHaveBeenCalledTimes(1);
	});

	it ('should load svg by url and assign name', () => {
		service = new SvgIconRegistryService(mockSvgLoader, PLATFORM_ID, serverUrl, document);
		const div = document.createElement('DIV');
		div.innerHTML = SVG;
		const svg = div.querySelector('svg') as SVGElement;
		mockSvgLoader.getSvg.and.returnValue(of(SVG));

		service.loadSvg('svg', 'sample').subscribe(data => {});

		service.getSvgByName('sample').subscribe(data => {
			expect(data).toEqual(svg);
		});
	});

	it ('should remove svg', () => {
		service = new SvgIconRegistryService(mockSvgLoader, PLATFORM_ID, serverUrl, document);
		service.addSvg('svg', SVG);

		service.unloadSvg('svg');

		service.getSvgByName('svg').subscribe(data => {
		}, err => {
			expect(err).toBe(`No svg with name 'svg' has been loaded`);
		});
	});

});
