"use strict";

describe("keyboard-shortcut", function () {
  var KeyboardShortcuts;
  beforeEach(angular.mock.module('angular-keyboard'));


  beforeEach(inject(function (_KeyboardShortcuts_) {
    spyOn(Mousetrap, 'bind');
    spyOn(Mousetrap, 'unbind');
    KeyboardShortcuts = _KeyboardShortcuts_;
  }));

  describe('#register', function() {
    it('add the keyboard shortcut to the public shortcuts', function () {
      KeyboardShortcuts.register('test1', 'ctrl-a', function(){});
      expect(KeyboardShortcuts.actions()).toEqual([jasmine.objectContaining({
        name: 'test1',
        keybinding: 'ctrl-a'
      })]);
    });

    it('doesnt add keyboard shortcut to the public shortcuts if private', function () {
      KeyboardShortcuts.register('test1', 'ctrl-a', function(){}, {private: true});
      expect(KeyboardShortcuts.actions()).toEqual([]);
    });

    it('calls bind', function() {
      KeyboardShortcuts.register('test1', 'ctrl-a', function(){});
      expect(Mousetrap.bind).toHaveBeenCalled();
    });
  });

  describe('#remove', function() {
    beforeEach(function() {
      KeyboardShortcuts.register('test1', 'ctrl-a', function(){});
      KeyboardShortcuts.remove('test1', 'ctrl-a');
    });
    it('removes it from the public actions', function() {
      expect(KeyboardShortcuts.actions()).toEqual([]);
    });
    it('calls unbind', function() {
      expect(Mousetrap.unbind).toHaveBeenCalled();
    });
  });

});
