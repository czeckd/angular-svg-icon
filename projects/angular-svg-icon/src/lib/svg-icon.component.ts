
import { ChangeDetectorRef, Component, DoCheck, ElementRef, Input,
	KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDiffers,
	OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges } from '@angular/core';

import { Subscription } from 'rxjs';

import { SvgIconRegistryService } from './svg-icon-registry.service';


class SvgIconHelper {
	svg!: SVGElement;
	icnSub!: Subscription;
	differ?: KeyValueDiffer<string, string|number>;
	loaded = false;
}

@Component({
	selector: 'svg-icon',
	template: '<ng-content></ng-content>'
})
export class SvgIconComponent implements OnInit, OnDestroy, OnChanges, DoCheck {
	@Input() src!: string;
	@Input() name?: string;
	@Input() stretch = false;
	@Input() applyClass = false;
	/** @deprecated since 9.1.0 */
	@Input() applyCss = false;
	@Input() svgClass?: any;
	// tslint:disable-next-line:no-input-rename
	@Input('class') klass?: any;
	@Input() viewBox?: string;
	@Input() svgAriaLabel?: string;

	// Adapted from ngStyle (see:  angular/packages/common/src/directives/ng_style.ts)
	@Input()
	set svgStyle(values: {[klass: string]: any }|null) {
		this._svgStyle = values;
		if (!this.helper.differ && values) {
			this.helper.differ = this.differs.find(values).create();
		}
	}

	private helper = new SvgIconHelper();
	private _svgStyle: {[key: string]: any} | null = null;

	constructor(
		private element: ElementRef,
		private differs: KeyValueDiffers,
		private renderer: Renderer2,
		private iconReg: SvgIconRegistryService,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.init();
	}

	ngOnDestroy() {
		this.destroy();
	}

	ngOnChanges(changeRecord: SimpleChanges) {
		const elemSvg = this.element.nativeElement.firstChild;

		if (changeRecord.src || changeRecord.name) {
			if (this.helper.loaded) {
				this.destroy();
			}
			this.init();
		}
		if (changeRecord.stretch) {
			this.stylize();
		}

		if (changeRecord.applyClass) {
			if (this.applyClass) {
				this.setClass(elemSvg, null, this.klass);
			} else {
				this.setClass(elemSvg, this.klass, null);
			}
		}

		if (changeRecord.svgClass) {
			this.setClass(elemSvg, changeRecord.svgClass.previousValue, changeRecord.svgClass.currentValue);
		}

		if (changeRecord.klass) {
			const elem = this.element.nativeElement;
			this.setClass(elem, changeRecord.klass.previousValue, changeRecord.klass.currentValue);

			if (this.applyClass) {
				this.setClass(elemSvg, changeRecord.klass.previousValue, changeRecord.klass.currentValue);
			} else {
				this.setClass(elemSvg, changeRecord.klass.previousValue, null);
			}
		}

		if (changeRecord.viewBox) {
			if (this.helper.loaded) {
				this.destroy();
			}
			this.init();
		}
		if (changeRecord.applyCss) {
			console.warn('applyCss deprecated since 9.1.0, will be removed in 10.0.0');
			console.warn('use applyClass instead');
		}

		if (changeRecord.svgAriaLabel) {
			this.doAria(changeRecord.svgAriaLabel.currentValue);
		}
	}

	ngDoCheck() {
		if (this.helper.svg && this.helper.differ) {
			const changes = this.helper.differ.diff(this._svgStyle!);
			if (changes) {
				this.applyChanges(changes);
			}
		}
	}

	private init() {
		if (this.name) {
			const svgObs = this.iconReg.getSvgByName(this.name);
			if (svgObs) {
				this.helper.icnSub = svgObs.subscribe(svg => this.initSvg(svg));
			}
		} else if (this.src) {
			const svgObs = this.iconReg.loadSvg(this.src);
			if (svgObs) {
				this.helper.icnSub = svgObs.subscribe(svg => this.initSvg(svg));
			}
		} else {
			const elem = this.element.nativeElement;
			elem.innerHTML = '';
			this.cdr.markForCheck();
		}
	}

	private initSvg(svg: SVGElement|undefined): void {
		if (!this.helper.loaded && svg) {
			this.setSvg(svg);
			this.resetDiffer();
		}
	}

	private destroy() {
		if (this.helper.icnSub) {
			this.helper.icnSub.unsubscribe();
		}
		this.helper = new SvgIconHelper();
	}

	private resetDiffer() {
		if (this._svgStyle && !this.helper.differ) {
			this.helper.differ = this.differs.find(this._svgStyle).create();
		}
	}

	private setSvg(svg: SVGElement) {
		if (!this.helper.loaded && svg) {
			this.helper.svg = svg;
			const icon = svg.cloneNode(true) as SVGElement;
			const elem = this.element.nativeElement;

			elem.innerHTML = '';
			this.renderer.appendChild(elem, icon);
			this.helper.loaded = true;

			this.copyNgContentAttribute(elem, icon);

			if (this.klass && this.applyClass) {
				this.setClass(elem.firstChild, null, this.klass);
			}

			if (this.svgClass) {
				this.setClass(elem.firstChild, null, this.svgClass);
			}

			if (this.viewBox) {
				if (this.viewBox === 'auto') {
					// Attempt to convert height & width to a viewBox.
					const w = icon.getAttribute('width');
					const h = icon.getAttribute('height');
					if (h && w) {
						const vb = `0 0 ${w} ${h}`;
						this.renderer.setAttribute(icon, 'viewBox', vb);
						this.renderer.removeAttribute(icon, 'width');
						this.renderer.removeAttribute(icon, 'height');
					}
				} else if (this.viewBox !== '') {
					this.renderer.setAttribute(icon, 'viewBox', this.viewBox);
					this.renderer.removeAttribute(icon, 'width');
					this.renderer.removeAttribute(icon, 'height');
				}
			}

			this.stylize();

			// If there is not a svgAriaLabel and the SVG has an arial-label, then do not override
			// the SVG's aria-label.
			if (!(this.svgAriaLabel === undefined && elem.firstChild.hasAttribute('aria-label'))) {
				this.doAria(this.svgAriaLabel || '');
			}

			this.cdr.markForCheck();
		}
	}

	private copyNgContentAttribute(hostElem: any, icon: SVGElement) {
		const attributes = hostElem.attributes as NamedNodeMap;
		const len = attributes.length;
		for (let i = 0; i < len; i += 1) {
			const attribute = attributes.item(i);
			if (attribute && attribute.name.startsWith('_ngcontent')) {
				this.setNgContentAttribute(icon, attribute.name);
				break;
			}
		}
	}

	private setNgContentAttribute(parent: Node, attributeName: string) {
		this.renderer.setAttribute(parent, attributeName, '');
		const len = parent.childNodes.length;
		for (let i = 0; i < len; i += 1) {
			const child = parent.childNodes[i];
			if (child instanceof Element) {
				this.setNgContentAttribute(child, attributeName);
			}
		}
	}

	private stylize() {
		if (this.helper.svg) {
			const svg = this.element.nativeElement.firstChild;

			if (this.stretch === true) {
				this.renderer.setAttribute(svg, 'preserveAspectRatio', 'none');
			} else if (this.stretch === false) {
				this.renderer.removeAttribute(svg, 'preserveAspectRatio');
			}
		}
	}

	private applyChanges(changes: KeyValueChanges<string, string|number>) {
		changes.forEachRemovedItem((record: KeyValueChangeRecord<string, string|number>) => this.setStyle(record.key, null));
		changes.forEachAddedItem((record: KeyValueChangeRecord<string, string|number>) => this.setStyle(record.key, record.currentValue));
		changes.forEachChangedItem((record: KeyValueChangeRecord<string, string|number>) => this.setStyle(record.key, record.currentValue));
	}

	private setStyle(nameAndUnit: string, value: string|number|null|undefined) {
		const [name, unit] = nameAndUnit.split('.');
		value = value !== null && unit ? `${value}${unit}` : value;
		const svg = this.element.nativeElement.firstChild;

		if (value !== null) {
			this.renderer.setStyle(svg, name, value as string);
		} else {
			this.renderer.removeStyle(svg, name);
		}
	}

	private setClass(target: HTMLElement|SVGSVGElement, previous: string|string[]|null, current: string|string[]|null) {
		if (target) {
			if (previous) {
				const klasses = (Array.isArray(previous) ? previous : previous.split(' ')).filter((klass) => klass);
				for (const k of klasses) {
					this.renderer.removeClass(target, k);
				}
			}
			if (current) {
				const klasses = (Array.isArray(current) ? current : current.split(' ')).filter((klass) => klass);
				for (const k of klasses) {
					this.renderer.addClass(target, k);
				}
			}
		}
	}

	private doAria(label: string) {
		const svg = this.element.nativeElement.firstChild;
		if (svg) {
			if (label === '') {
				this.renderer.setAttribute(svg, 'aria-hidden', 'true');
				this.renderer.removeAttribute(svg, 'aria-label');
			} else {
				this.renderer.removeAttribute(svg, 'aria-hidden');
				this.renderer.setAttribute(svg, 'aria-label', label);
			}
		}
	}

}
