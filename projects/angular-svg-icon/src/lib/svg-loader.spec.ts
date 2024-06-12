import { inject, TestBed, getTestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { SvgHttpLoader } from './svg-loader';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SvgHttpLoader', () => {
	const SVG = `<svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z" /></svg>`;

	beforeEach(() => {
		TestBed.configureTestingModule({
    imports: [],
    providers: [SvgHttpLoader, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
	});

	describe('getSvg', () => {
		it ('should return SVG',
			inject(
				[ HttpTestingController, SvgHttpLoader ],
				( httpMock: HttpTestingController, loader: SvgHttpLoader) => {

					loader.getSvg('svg').subscribe( data => {
						expect(data).toBe(SVG);
					});

					const req = httpMock.expectOne('svg');
					expect(req.request.method).toEqual('GET');

					req.flush(SVG);
				}
			)
		);
	});
});
