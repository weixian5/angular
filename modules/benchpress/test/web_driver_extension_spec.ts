import {
  afterEach,
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';

import {isPresent, StringWrapper} from 'angular2/src/core/facade/lang';
import {PromiseWrapper} from 'angular2/src/core/facade/async';

import {WebDriverExtension, bind, Injector, Options} from 'benchpress/common';

export function main() {
  function createExtension(ids: any[], caps) {
    return PromiseWrapper.wrap(() => {
      return Injector.resolveAndCreate([
                       ids.map(id => bind(id).toValue(new MockExtension(id))),
                       bind(Options.CAPABILITIES).toValue(caps),
                       WebDriverExtension.bindTo(ids)
                     ])
          .get(WebDriverExtension);
    });
  }

  describe('WebDriverExtension.bindTo', () => {

    it('should bind the extension that matches the capabilities',
       inject([AsyncTestCompleter], (async) => {
         createExtension(['m1', 'm2', 'm3'], {'browser': 'm2'})
             .then((m) => {
               expect(m.id).toEqual('m2');
               async.done();
             });
       }));

    it('should throw if there is no match', inject([AsyncTestCompleter], (async) => {
         PromiseWrapper.catchError(createExtension(['m1'], {'browser': 'm2'}), (err) => {
           expect(isPresent(err)).toBe(true);
           async.done();
         });
       }));
  });
}

class MockExtension extends WebDriverExtension {
  id: string;

  constructor(id) {
    super();
    this.id = id;
  }

  supports(capabilities: {[key: string]: any}): boolean {
    return StringWrapper.equals(capabilities['browser'], this.id);
  }
}
