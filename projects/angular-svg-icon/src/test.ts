// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
}
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);

/**
 * Get typed object as a jasmine spy, so each method of the spied object is changed to a jasmyne.Spy type!
 * This will help you to get the intellisense and auto completition from vs code!
 *
 * It could be used this way:
 *
 * supposing we hace the class MyService like:
 *
 * class MyService {
 *   public factor = 10;
 *   add(a: number,b:number): number {
 *     return a + b;
 *   }
 * }
 *
 * In our test we can declare our jasmine spy this way:
 *
 * let serviceSpy: Spied<MyService> = jasmine.createSpyObj("serviceSpy", ["add"]);
 *
 * So serviceSpy.add instead of been a number type, it gonna be a jasmine.Spy.
 * but factory stills declared as number
 */
export type Spied<T> = {
	-readonly [Key in keyof T]: T[Key] extends ((...args: any[]) => any)
		? jasmine.Spy
		: T[Key]
};
