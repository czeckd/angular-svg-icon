import { Component, inject, ElementRef, KeyValueChanges, KeyValueDiffer, KeyValueDiffers,
	OnDestroy, Renderer2, ChangeDetectionStrategy,
	input, effect, signal} from '@angular/core';

import { Subscription } from 'rxjs';

import { SvgIconRegistryService } from './svg-icon-registry.service';


class SvgIconHelper {
	svg!: SVGElement;
	icnSub!: Subscription;
	differ?: KeyValueDiffer<string, string|number>;
	loaded = false;
}

@Component({
	standalone: true,
	selector: 'svg-icon',
	template: '<ng-content></ng-content>',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgIconComponent implements OnDestroy {
	private element = inject(ElementRef);
	private differs = inject(KeyValueDiffers);
	private renderer = inject(Renderer2);
	private iconReg = inject(SvgIconRegistryService);

	src = input<string>();
	name = input<string>();
	stretch = input(false);
	applyClass = input(false);
	svgClass = input<any>();
	klass = input<any>(undefined, {alias: 'class'});
	viewBox = input<string>();
	svgAriaLabel = input<string>();
	onSVGLoaded = input<(svg: SVGElement, parent: HTMLElement) => SVGElement>();
	svg = signal(0);

	// Adapted from ngStyle (see:  angular/packages/common/src/directives/ng_style.ts)
	svgStyle = input<{[klass: string]: any }|null>();

	private helper = new SvgIconHelper();

	constructor() {
		// Watch for src or name changes
		effect(() => {
			if (this.src() || this.name()) {
				this.destroy();
				this.init(this.src(), this.name());
			}
		});

		// Watch for viewBox changes
		effect(() => {
			const viewBox = this.viewBox();
			if (!this.svg()) return;
			this.updateViewBox(viewBox);
		});

		// Watch for style changes
		effect(() => {
			const values = this.svgStyle() || {};
			if (!this.svg()) return;
			this.applyChanges(this.helper.differ!.diff(values)!);
		});

		// Watch for applyClass changes
		effect(() => {
			const _ = this.svg();
			if (this.applyClass()) {
				this.setClass(this.elemSvg, null, this.klass());
			} else {
				this.setClass(this.elemSvg, this.klass(), null);
			}
		});

		// Watch for svgClass changes
		let previousSvgClass: string|string[]|null;
		effect(() => {
			const _ = this.svg();
			this.setClass(this.elemSvg, previousSvgClass, this.svgClass());
			previousSvgClass = this.svgClass();
		});

		// Watch for klass changes
		let previousKlass: string|string[]|null;
		effect(() => {
			const _ = this.svg();
			const elem = this.element.nativeElement;
			this.setClass(elem, previousKlass, this.klass());

			this.setClass(this.elemSvg, previousKlass, this.applyClass() ? this.klass() : null);
			previousKlass = this.klass();
		});

		// Watch for svgAriaLabel changes
		effect(() => {
			const _ = this.svg();
			this.doAria(this.svgAriaLabel()!);
		});

		// Watch for stretch changes
		effect(() => {
			const _ = this.svg();
			this.stylize(this.stretch());
		});
	}

	ngOnDestroy() {
		this.destroy();
	}

	get elemSvg() {
		return this.element.nativeElement.firstChild;
	}

	private init(src?: string, name?: string) {
		if (src && name) {
			const svgObs = this.iconReg.loadSvg(src, name);
			if (svgObs) {
				this.helper.icnSub = svgObs.subscribe(svg => this.initSvg(svg));
			}
		} else if (name) {
			const svgObs = this.iconReg.getSvgByName(name);
			if (svgObs) {
				this.helper.icnSub = svgObs.subscribe(svg => this.initSvg(svg));
			}
		} else if (src) {
			const svgObs = this.iconReg.loadSvg(src);
			if (svgObs) {
				this.helper.icnSub = svgObs.subscribe(svg => this.initSvg(svg));
			}
		} else {
			this.element.nativeElement.innerHTML = '';
			this.svg.set(0);
		}
	}

	private initSvg(svg: SVGElement|undefined): void {
		if (!this.helper.loaded && svg) {
			this.setSvg(svg);
		}
	}

	private destroy() {
		this.helper.icnSub?.unsubscribe();
		this.helper = new SvgIconHelper();
		// initialize differ with empty object
		this.helper.differ = this.differs.find({}).create();
	}

	private setSvg(svg: SVGElement) {
		if (!this.helper.loaded && svg) {
			this.helper.svg = svg;
			let icon = svg.cloneNode(true) as SVGElement;
			const elem = this.element.nativeElement;
			const onLoadCallback = this?.onSVGLoaded();
			if (onLoadCallback) {
				icon = onLoadCallback(icon, elem);
			}

			elem.innerHTML = '';
			this.renderer.appendChild(elem, icon);
			this.helper.loaded = true;
			this.copyNgContentAttribute(elem, icon);
			this.svg.update(x => x + 1);
		}
	}

	private updateViewBox(viewBox?: string) {
		if (viewBox) {
			const icon = this.elemSvg;
			if (viewBox === 'auto') {
				// Attempt to convert height & width to a viewBox.
				const w = icon.getAttribute('width');
				const h = icon.getAttribute('height');
				if (h && w) {
					const vb = `0 0 ${w} ${h}`;
					this.renderer.setAttribute(icon, 'viewBox', vb);
					this.renderer.removeAttribute(icon, 'width');
					this.renderer.removeAttribute(icon, 'height');
				}
			} else if (viewBox !== '') {
				this.renderer.setAttribute(icon, 'viewBox', viewBox!);
				this.renderer.removeAttribute(icon, 'width');
				this.renderer.removeAttribute(icon, 'height');
			}
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

	private stylize(stretch: boolean) {
		if (this.helper.svg) {
			const svg = this.element.nativeElement.firstChild;

			if (stretch === true) {
				this.renderer.setAttribute(svg, 'preserveAspectRatio', 'none');
			} else if (stretch === false) {
				this.renderer.removeAttribute(svg, 'preserveAspectRatio');
			}
		}
	}

	private applyChanges(changes: KeyValueChanges<string, string|number>) {
		if (!changes) return;

		changes.forEachRemovedItem((record) => this.setStyle(record.key, null));
		changes.forEachAddedItem((record) => this.setStyle(record.key, record.currentValue));
		changes.forEachChangedItem((record) => this.setStyle(record.key, record.currentValue));
	}

	private setStyle(nameAndUnit: string, value: string|number|null|undefined) {
		const [name, unit] = nameAndUnit.split('.');
		value = value !== null && unit ? `${value}${unit}` : value;
		const svg = this.elemSvg;

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
    if (label !== undefined) {
  		const svg = this.element.nativeElement.firstChild;
	  	// If there is not a svgAriaLabel and the SVG has an arial-label, then do not override
		  // the SVG's aria-label.
		  if (svg && !svg.hasAttribute('aria-label')) {
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
}
