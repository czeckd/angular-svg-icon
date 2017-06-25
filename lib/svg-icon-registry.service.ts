import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Injectable, Optional, RendererFactory2, ViewEncapsulation, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';


@Injectable()
export class SvgIconRegistryService {

	private iconsByUrl = new Map<string, SVGElement>();
	private iconsLoadingByUrl = new Map<string, Observable<SVGElement>>();

	constructor(
		private http:Http,
		private rendererFactory: RendererFactory2,
		@Inject(DOCUMENT) private document
	) {
	}

	loadSvg(url:string): Observable<SVGElement> {

		if (this.iconsByUrl.has(url)) {
			return Observable.of(this.iconsByUrl.get(url));
		} else if (this.iconsLoadingByUrl.has(url)) {
			return this.iconsLoadingByUrl.get(url);
		} else {
			const o = <Observable<SVGElement>> this.http.get( url )
				.map( (res:Response) => {
					try {
						const renderer = this.rendererFactory.createRenderer(this.document, {
							id: '-1',
							encapsulation: ViewEncapsulation.None,
							styles: [],
							data: {}
						});

						const div = renderer.createElement('div');
						renderer.setProperty(div,'innerHTML',res.text());
						return <SVGElement> div ;

					} catch (e) {
						console.error('Error within linkService : ', e);
					}
				})
				.do(svg => {
					this.iconsByUrl.set(url, svg);
				})
				.finally(() => {
					this.iconsLoadingByUrl.delete(url);
				})
				.share();

			this.iconsLoadingByUrl.set(url, o);
			return o;
		}
	}
}
