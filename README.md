[![npm version](https://badge.fury.io/js/angular-svg-icon.svg)](https://badge.fury.io/js/angular-svg-icon)

Angular SVG Icon
=========

The **angular-svg-icon** is an Angular 18 service and component that provides a
means to inline SVG files to allow for them to be easily styled by CSS and code.

The service provides an icon registery that loads and caches a SVG indexed by
its url. The component is responsible for displaying the SVG. After getting the
svg from the registry it clones the `SVGElement` and the SVG to the component's
inner HTML.

This [demo](https://czeckd.github.io/angular-svg-icon/) shows this module in action.

## How to use?

```
$ npm i angular-svg-icon --save
```

## Versions

The latest version of the package is for Angular 18.

:grey_exclamation: **BREAKING CHANGE**: as of angular-svg-icon@18.0.0, the package was converted to use 
`inject` and `signal` from `@common/core` for improved performance. Thus method calls that are inputs
should be avoided. Inputs are now signal inputs.

**Note on earlier versions of Angular:** 
- For Angular 17, use angular-svg-icon@17.0.0
- For Angular 16, use angular-svg-icon@16.1.0
- For Angular 15, use angular-svg-icon@15.0.0
- For Angular 14, use angular-svg-icon@14.0.0
- For Angular 13, use angular-svg-icon@13.0.0
- For Angular 12, use angular-svg-icon@12.0.0
- For Angular 11, use angular-svg-icon@11.2.0
- For Angular 10, use angular-svg-icon@10.0.0
- For Angular 9, use angular-svg-icon@9.2.0
- For Angular 8, use angular-svg-icon@8.0.0
- For Angular 7, use angular-svg-icon@7.2.1
- For Angular 6, use angular-svg-icon@6.0.0
- For Angular 4.3 through Angular 5.x, use angular-svg-icon@5.1.1
- For Angular 2.4 through Angular 4.2, use angular-svg-icon@4.2.6

See the module's accompanying README.md for instructions.

## Integration

The **angular-svg-icon** should work as-is with webpack/angular-cli. Just import the
``AngularSvgIconModule`` and the ```HttpClientModule```.

### Module Example

```typescript
import { HttpClientModule } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
  imports: [ HttpClientModule, AngularSvgIconModule.forRoot() ],
  ...
})
export class AppModule {}
```

### Standalone Example

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAngularSvgIcon } from 'angular-svg-icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideAngularSvgIcon()
  ]
};
```

:grey_exclamation: **BREAKING CHANGE**: as of angular-svg-icon@9.0.0, an explicit call to `forRoot()`
must be made on the module's import.

### Child Modules

Recommened usage pattern is to import `AngularSvgIconModule.forRoot()` in only the root AppModule of your application.
In child modules, import only `AngularSvgIconModule`.


### Use with Lazy Loading Feature Modules

Recommended usage pattern is to import `AngularSvgIconModule.forRoot()` in the root AppModule of your application.
This will allow for one `SvgIconRegistryService` to be shared across all modules.
If, for some reason, a lazily loaded module needs encapuslation of the service, then it is possible to load the 
`AngularSvgIconModule.forRoot()` in each lazy loaded module, but such usage precludes loading the package in the root
AppModule.

## Usage
Basic usage is:
```html
<svg-icon src="images/eye.svg" [svgStyle]="{ 'width.px':90 }"></svg-icon>
```
*Note that without a height or width set, the SVG may not display!*

Loading with a name:
```html
<svg-icon src="images/eye.svg" name="eye" [svgStyle]="{ 'width.px':90 }"></svg-icon>
```

If the SVG was previously loaded with a name either via the component or registry, then it can be used like this:
```html
<svg-icon name="eye" [svgStyle]="{ 'width.px':90 }"></svg-icon>
```

More complex styling can be applied to the svg, for example:
```html
<svg-icon src="images/eye.svg" [stretch]="true"
  [svgStyle]="{'width.px':170,'fill':'rgb(150,50,255)','padding.px':1,'margin.px':3}">
</svg-icon>
```

The following attributes can be set on svg-icon:
- **src** - The path to SVG.
- **name** - An optional name of SVG, under which it was loaded via SvgIconRegistryService.
- **[svgStyle]** - Optional styles to be applied to the SVG, this is based on the familiar [ngStyle].
- **[stretch]** - An optional boolean (default is false) that when true, sets `preserveAspectRatio="none"` on the SVG. This is useful for setting both the height and width styles to strech *or* distort the svg.
- **[class]** - An optional string of the class or classes to apply to the SVG (duplicates what is set on the `svg-icon`).
- **[applyClass]** - An optional boolean (default is false) that copies the `class` attribute on the `svg-icon` and adds it to the SVG.
- **[svgClass]** - An optional string of the class or classes to apply to the SVG (independent of what is set for the class on the `svg-icon`).
- **[viewBox]** - An optional string to set the viewBox on the SVG. If the `viewBox="auto"`, then `svg-icon` will attempt to convert the SVG's width and height attributes to a `viewBox="0 0 w h"`. Both explicitly setting the viewBox or `auto` setting the viewBox will remove the SVG's width and height attributes.
- **[svgAriaLabel]** - An optional string to set the SVG's `aria-label`. If the SVG does not have a pre-existing `aria-label` and the `svgAriaLabel` is not set, then the SVG will be loaded with `aria-hidden=true`. If the SVG has an `aria-label`, then the SVG's default will be used. To remove the SVG's `aria-label`, assign an empty string `''` to `svgAriaLabel`. Doing so will remove any existing `aria-label` and set `aria-hidden=true` on the SVG.
- **onSVGLoaded** - Callback function that is triggered when an SVG is successfully loaded into the DOM. This function allows you to perform custom actions or manipulations on the loaded SVG element after it has been fully loaded. It provides a convenient way to hook into the SVG loading process and execute additional logic or modifications. Parameters: svgElement (SVGElement): The loaded SVG element that you can manipulate or use in your custom logic.

Deprecated attribute:
- **[applyCss]** - Renamed as **[applyClass]** (as of v9.2.0).


### Using the Svg-Icon Registry
Programatic interaction with the registry is also possible.
Include the `private iconReg: SvgIconRegistryService` in the constructor:
```typescript
constructor(private iconReg:SvgIconRegistryService) { }
```

The registry has three public functions: `loadSvg(string)`, `addSvg(string, string)`, and `unloadSvg(string)`.

To preload a SVG file from a URL into the registry:
```typescript
{
  ...
  this.iconReg.loadSvg('foo.svg').subscribe();
}
```
To preload a SVG file from a URL into the registry with predefined name:
```typescript
{
  ...
  this.iconReg.loadSvg('foo.svg', 'foo').subscribe();
}
```
To add a SVG from a string:
```typescript
{
  ...
  this.iconReg.addSvg('box',
   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1 L1 9 L9 9 L9 1 Z"/></svg>'
  );
}
```
To unload a SVG from the registry.
```typescript
{
  ...
  this.iconReg.unloadSvg('foo.svg');
}
```

## Usage with Angular Universal

When rendering on server-side, the SVGs must be loaded via the file system.
This can be achieved by providing an `SvgLoader` to the server module:

```typescript
export function svgLoaderFactory(http: HttpClient, transferState: TransferState) {
  return new SvgServerLoader('browser/assets/icons', transferState);
}

@NgModule({
  imports: [
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [ HttpClient, TransferState ],
      }
    }),
    AppModule,
    ServerModule,
    ServerTransferStateModule,
    ModuleMapLoaderModule,
  ],
  bootstrap: [ AppComponent ],
})
export class AppServerModule {
}

// Standalone Example
@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ServerTransferStateModule,
    ModuleMapLoaderModule,
  ],
  providers: [ provideAngularSvgIcon({
      loader: {
        provide: SvgLoader,
        useFactory: svgLoaderFactory,
        deps: [ HttpClient, TransferState ],
      }
    }) ],
  bootstrap: [ AppComponent ],
})
export class AppServerModule {
}
```

The loader itself is up to you to implement because it depends on where your
icons are stored locally. An implementation that additionally saves the icons
in the transfer state of your app in order to avoid double requests could look
like that:

```typescript
const fs = require('fs');
const join = require('path').join;
const parseUrl = require('url').parse;
const baseName = require('path').basename;

export class SvgServerLoader implements SvgLoader {

  constructor(private iconPath: string,
    private transferState: TransferState) {
  }

  getSvg(url: string): Observable<string> {
    const parsedUrl:URL = parseUrl(url);
    const fileNameWithHash = baseName(parsedUrl.pathname);
    // Remove content hashing
    const fileName = fileNameWithHash.replace(/^(.*)(\.[0-9a-f]{16,})(\.svg)$/i, '$1$3');
    const filePath = join(this.iconPath, fileName);
    return Observable.create(observer => {
      const svgData = fs.readFileSync(filePath, 'utf8');

      // Here we save the translations in the transfer-state
      const key: StateKey<number> = makeStateKey<number>('transfer-svg:' + url);
      this.transferState.set(key, svgData);

      observer.next(svgData);
      observer.complete();
    });
  }
}
```

Note that this is executed in a local Node.js context, so the Node.js API is 
available.

A loader for the client module that firstly checks the transfer state could
look like that:

```typescript
export class SvgBrowserLoader implements SvgLoader {
  constructor(private transferState: TransferState,
    private http: HttpClient) {
  }
  getSvg(url: string): Observable<string> {
    const key: StateKey<number> = makeStateKey<number>('transfer-svg:' + url);
    const data = this.transferState.get(key, null);
    // First we are looking for the translations in transfer-state, if none found, http load as fallback
    if (data) {
      return Observable.create(observer => {
        observer.next(data);
        observer.complete();
      });
    } else {
      return new SvgHttpLoader(this.http).getSvg(url);
    }
  }
}
```

This is executed on browser side. Note that the fallback when no data is
available uses `SvgHttpLoader`, which is also the default loader if you don't
provide one.

## Example Project with Angular Universal and `angular-svg-icon`

An Angular Universal [example project](https://github.com/edulelis/demo-universal-angular-svg-loader) is also available. The basic steps to get it work is:

1. Add this snippet to the `package.json` file to prevent compilation issues:
```js
        "browser": {
          "fs": false,
          "path": false,
          "os": false
        }
```
2. Add `ServerTransferStateModule` to `app.server.module`
3. Add `BrowserTransferStateModule` to `app.module`
4. The loader should be different per platform, so the factory should receive the `PLATFORM_ID` and load the correct class appropriately (this is already added in the example).

## SVG Preparation
The SVG should be modified to remove the height and width attributes from the file
per Sara Soueidan's advice in "[Making SVGs Responsive With
CSS](http://tympanus.net/codrops/2014/08/19/making-svgs-responsive-with-css/)" if
size is to be modified through CSS. Removing the height and width has two immedate
impacts: (1) CSS can be used to size the SVG, and (2) CSS will be *required* to 
size the SVG.

## Background

The svg-icon is an Angular component that allows for the continuation of the
AngularJS method for easily inlining SVGs explained by [Ben
Markowitz](https://www.mobomo.com/2014/09/angular-js-svg/) and others. Including
the SVG source inline allows for the graphic to be easily styled by CSS.

The technique made use of ng-include to inline the svg source into the document.
Angular 2, however, dropped the support of ng-include, so this was my work-around
method.

*Note:* The [icon
component](https://www.npmjs.com/package/@angular2-material/icon) from
[angular/material2](https://github.com/angular/material2) used to have a direct
means to load svg similar to this, but this functionality was removed because of
security concerns.

## License

MIT


## Author
- David Czeck [@czeckd](https://github.com/czeckd) and 
[community contributors](https://github.com/czeckd/angular-svg-icon/graphs/contributors). Thank you!

