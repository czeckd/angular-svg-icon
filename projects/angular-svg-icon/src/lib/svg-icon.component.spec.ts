import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { provideAngularSvgIcon, SvgIconComponent, SvgIconRegistryService } from '../public-api';

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1 L9 9"/></svg>';

describe('SvgIconComponent aria labels', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [SvgIconComponent],
			providers: [provideHttpClient(), provideAngularSvgIcon()]
		});
		const registry = TestBed.inject(SvgIconRegistryService);
		registry.addSvg('plain', SVG);
		registry.addSvg('labelled', SVG.replace('<svg ', '<svg aria-label="original" '));
	});

	afterEach(() => TestBed.resetTestingModule());

	function render(name: string, label?: string) {
		const fixture = TestBed.createComponent(SvgIconComponent);
		fixture.componentRef.setInput('name', name);
		fixture.componentRef.setInput('svgAriaLabel', label);
		fixture.detectChanges();
		return fixture;
	}

	it('hides an unlabelled SVG when no label is supplied', () => {
		const fixture = render('plain');
		const svg = fixture.nativeElement.querySelector('svg');
		expect(svg.getAttribute('aria-hidden')).toBe('true');
		expect(svg.hasAttribute('aria-label')).toBeFalse();
	});

	it('preserves the SVG label when no label is supplied', () => {
		const fixture = render('labelled');
		const svg = fixture.nativeElement.querySelector('svg');
		expect(svg.getAttribute('aria-label')).toBe('original');
		expect(svg.hasAttribute('aria-hidden')).toBeFalse();
	});

	it('updates, clears and restores the label through the input', () => {
		const fixture = render('labelled', 'first');
		const svg = fixture.nativeElement.querySelector('svg');
		expect(svg.getAttribute('aria-label')).toBe('first');

		fixture.componentRef.setInput('svgAriaLabel', 'second');
		fixture.detectChanges();
		expect(svg.getAttribute('aria-label')).toBe('second');

		fixture.componentRef.setInput('svgAriaLabel', '');
		fixture.detectChanges();
		expect(svg.hasAttribute('aria-label')).toBeFalse();
		expect(svg.getAttribute('aria-hidden')).toBe('true');

		fixture.componentRef.setInput('svgAriaLabel', undefined);
		fixture.detectChanges();
		expect(svg.getAttribute('aria-label')).toBe('original');
		expect(svg.hasAttribute('aria-hidden')).toBeFalse();
	});

	it('clears an existing SVG label with an initially empty input', () => {
		const fixture = render('labelled', '');
		const svg = fixture.nativeElement.querySelector('svg');
		expect(svg.hasAttribute('aria-label')).toBeFalse();
		expect(svg.getAttribute('aria-hidden')).toBe('true');
	});

	it('uses the new SVG default after changing icons without modifying the cache', () => {
		const fixture = render('labelled', 'override');
		fixture.componentRef.setInput('name', 'plain');
		fixture.detectChanges();
		fixture.componentRef.setInput('svgAriaLabel', undefined);
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('svg').getAttribute('aria-hidden')).toBe('true');

		const second = render('labelled');
		expect(second.nativeElement.querySelector('svg').getAttribute('aria-label')).toBe('original');
	});
});
