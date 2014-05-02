"use strict";

describe("keyboard-shortcut", function () {
  var element, $scope;
  beforeEach(angular.mock.module('angular-keyboard'));
  
  beforeEach(inject(function ($compile, $rootScope) {
    $scope  = $rootScope.$new();
    element = $compile('<div><a keyboard-shortcut="a" keyboard-title="Test"></a><keyboard-help></keyboard-help>')($scope);
    $scope.$apply();
  }));

  it('shows the appropriate help', function () {
    expect(element.find('keyboard-help').text()).toEqual('ATest')
  });
});