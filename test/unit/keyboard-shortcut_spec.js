"use strict";

describe("keyboard-shortcut", function () {
  var element, $scope, KeyboardShortcuts;;
  beforeEach(angular.mock.module('angular-keyboard'));

  var setupElement = function (source) {
    beforeEach(inject(function ($compile, $rootScope) {
      $scope  = $rootScope.$new();
      element = $compile(source)($scope);
    }));
  };

  var setupElementMock = function (source) {
    beforeEach(inject(function ($compile, $rootScope, _KeyboardShortcuts_) {
      KeyboardShortcuts = _KeyboardShortcuts_;
      $scope  = $rootScope.$new();
      spyOn(KeyboardShortcuts, 'register');
      spyOn(KeyboardShortcuts, 'remove');
      element = $compile(source)($scope);
    }));
  }

  describe('default behavior', function () {
    setupElement('<a keyboard-shortcut="a" ng-click="callback()">Link</a>');

    it("sends a click when the keyboard shortcut is pressed", function () {
      var clicked = false;
      $scope.callback = function () {
        clicked = true;
        return false;
      };
      triggerKeyEvent(65);
      $scope.$apply();
      expect(clicked).toBe(true);
    });
  });

  describe(':keyboardTitle', function () {
    setupElementMock('<a keyboard-shortcut="a" keyboard-title="Title">Link</a>');

    it('registers with the appropriate signature', function () {
      expect(KeyboardShortcuts.register).toHaveBeenCalled();
      expect(KeyboardShortcuts.register.calls[0].args[0]).toEqual('Title')
    });

    it('sets the html title attr', function () {
      expect(element.attr('title')).toEqual('Title (A)');
    });
  });

  describe(':keyboardTitle', function () {
    setupElementMock('<a keyboard-shortcut="a" keyboard-title="Title">Link</a>');

    it('registers with the appropriate signature', function () {
      expect(KeyboardShortcuts.register).toHaveBeenCalled();
      expect(KeyboardShortcuts.register.calls[0].args[0]).toEqual('Title')
    });

    it('sets the html title attr', function () {
      expect(element.attr('title')).toEqual('Title (A)');
    });
  });

  describe(':keyboardAction', function () {
    setupElement('<a keyboard-shortcut="a" keyboard-action="callback()">Link</a>');

    it("triggers the action when the keyboard shortcut is pressed", function () {
      var triggered = false;
      $scope.callback = function () {
        triggered = true;
        return false;
      };
      triggerKeyEvent(65);
      $scope.$apply();
      expect(triggered).toBe(true);
    });
  });

  describe(':keyboardTrigger', function () {
    setupElement('<form ng-submit="callback()"><a keyboard-shortcut="a" keyboard-trigger="submit">Link</a></form>');

    xit("triggers the action when the keyboard shortcut is pressed", function () {
      // pending();
      var triggered = false;
      $scope.callback = function () {
        triggered = true;
        return false;
      };
      triggerKeyEvent(65);
      $scope.$apply();
      expect(triggered).toBe(true);
    });
  });

  describe(':keyboardPreventDefault', function () {
    setupElementMock('<a keyboard-shortcut="a" keyboard-prevent-default>Link</a>');

    it('registers with the appropriate signature', function () {
      expect(KeyboardShortcuts.register).toHaveBeenCalled();
      expect(KeyboardShortcuts.register.calls[0].args[3].preventDefault).toBe(true);
    });
  });

  describe(':shortcutIf', function () {
    setupElementMock('<a keyboard-shortcut="a" shortcut-if="condition">Link</a>');

    it('registers when condition is true', function () {
      $scope.condition = true;
      $scope.$apply();
      expect(KeyboardShortcuts.register).toHaveBeenCalled();
    });

    it('removes when condition is false', function () {
      $scope.condition = false;
      $scope.$apply();
      expect(KeyboardShortcuts.remove).toHaveBeenCalled();
    });
  });
});
