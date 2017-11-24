import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/delay';

import { Http, Response } from '@angular/http';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SvgIconRegistryService {

	private iconsByUrl = new Map<string, SVGElement>();
	private iconsLoadingByUrl = new Map<string, Observable<SVGElement>>();

	constructor(private http:Http) {
	}

	loadSvg(url:string, symbolID:string = ''): Observable<SVGElement> {
		const orgUrl = url;
		url += `#${symbolID}`;
		// Icon is already loaded and cached (srpite or not)
		if (this.iconsByUrl.has(url)) {
			return Observable.of(this.iconsByUrl.get(url));
		}
		// Sprite required, but sprite SVG is loading, delay loading (until sprite SVG is loaded)
		else if (symbolID && this.iconsLoadingByUrl.has(orgUrl)) {
				return Observable.of(true).delay(100).mergeMap(() => this.loadSvg(orgUrl, symbolID));
		}
		// Sprite required,  sprite SVG is loaded, but sprite isn't cache yet
		else if (symbolID &&  this.iconsByUrl.get(orgUrl)) {
			return Observable.of(this.getSprite(this.iconsByUrl.get(orgUrl), symbolID));
		}
		// Else start load SVG file
		else
		{
			const o = <Observable<SVGElement>> this.http.get( orgUrl )
				.map( (res:Response) => {
					const div = document.createElement('DIV');
					div.innerHTML = res.text();
					const svg =  <SVGElement>div.querySelector('svg');
					if (symbolID) {
						this.iconsByUrl.set(orgUrl, svg);
						return this.getSprite(svg, symbolID);
					} else {
						return svg;
					}
				})
				.do(svg => {
					this.iconsByUrl.set(url, svg);
				})
				.finally(() => {
					this.iconsLoadingByUrl.delete(orgUrl);
				})
				.share();

			this.iconsLoadingByUrl.set(orgUrl, o);
			return o;
		}
	}

	unloadSvg(url:string) {
		if (this.iconsByUrl.has(url)) {
			this.iconsByUrl.delete(url);
		}
	}

	// Extract sprite
	getSprite(svg: SVGElement, symbolID: string) {
		const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		const spriteElement: SVGSVGElement = svg.querySelector(`#${symbolID}`);
		svgElement.setAttribute('width', spriteElement.viewBox.baseVal.width + 'px');
		svgElement.setAttribute('height', spriteElement.viewBox.baseVal.height + 'px');
		for (let i = 0 ; i < spriteElement.childNodes.length; i++) {
			svgElement.appendChild(spriteElement.childNodes[i].cloneNode(true));
		}
		return svgElement;
	}
}
