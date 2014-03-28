"use strict";

describe("keyboard-shortcut", function () {
  var element, $scope;
  beforeEach(angular.mock.module('angular-keyboard'));
  
  beforeEach(inject(function ($compile, $rootScope) {
    $scope  = $rootScope.$new();
    element = $compile("<a keyboard-shortcut='ctrl-a'></a>")($scope);
  }));
  
  it("sends a click when the keyboard shortcut is pressed", function () {
    var clicked = false;
    element.click(function () {
      clicked = true;
      return false;
    });
    element.trigger(jQuery.Event( "keydown", { keyCode: 64, ctrlKey: true } ));
    $scope.$apply();
    expect(clicked).toBe(true);
  })
})