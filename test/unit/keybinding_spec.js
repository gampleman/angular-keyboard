"use strict";

describe("keyboard-shortcut", function () {
  var keybinding;
  beforeEach(angular.mock.module('angular-keyboard'));
  
  beforeEach(inject(function ($filter) {
    keybinding = $filter('keybinding');
  }));

  describe('plaintext mode', function () {
    it('uppercases simple letters', function () {
      expect(keybinding('a')).toEqual('A');
    });
  
    it('formats combos', function () {
      expect(keybinding('a+b')).toEqual('AB');
    });
    
    it('formats sequences', function () {
      expect(keybinding('a b')).toEqual('A › B');
    });
    
    it('formats modifiers', function () {
      expect(keybinding('ctrl')).toEqual('Ctrl');
      expect(keybinding('alt')).toEqual('⌥');
      expect(keybinding('command')).toEqual('⌘');
      expect(keybinding('meta')).toEqual('⌘');
      expect(keybinding('shift')).toEqual('⇧');
    });
  });
  
  describe('html mode', function () {
    it('uppercases simple letters', function () {
      expect(keybinding('a', true).$$unwrapTrustedValue()).toEqual('<kbd>A</kbd>');
    });

    it('formats combos', function () {
      expect(keybinding('a+b', true).$$unwrapTrustedValue()).toEqual('<kbd>A</kbd><kbd>B</kbd>');
    });

    it('formats sequences', function () {
      expect(keybinding('a b', true).$$unwrapTrustedValue()).toEqual('<kbd>A</kbd> <span class="keyboard-separator">&#8250;</span> <kbd>B</kbd>');
    });

    it('formats modifiers', function () {
      expect(keybinding('ctrl', true).$$unwrapTrustedValue()).toEqual('<kbd>Ctrl</kbd>');
      expect(keybinding('alt', true).$$unwrapTrustedValue()).toEqual('<kbd>&#x2325;</kbd>');
      expect(keybinding('command', true).$$unwrapTrustedValue()).toEqual('<kbd>&#x2318;</kbd>');
      expect(keybinding('meta', true).$$unwrapTrustedValue()).toEqual('<kbd>&#x2318;</kbd>');
      expect(keybinding('shift', true).$$unwrapTrustedValue()).toEqual('<kbd>&#x21E7;</kbd>');
    });
  });
});
