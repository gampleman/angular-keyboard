/**
 * @ngdoc directive
 * @name angular-keyboard.directive:keyboardSelectable
 * @restrict A
 * @description
 * Used for performing keyboard actions on lists of items. It must be specified on the parent element as ng-repeat and exposes another scope variable to it's elements: `keyboardSelected` which is a boolean indicating selection on the particular class.
 * 
 * # Status
 * This directive is **not** available yet.
 * @example
  <example module="example">
    <file name="index.html">
    <div ng-controller="ctrl">
      <div keyboard-selectable select-next="down">
        <div ng-repeat="a in as">{{a}}</div>
      </div>
    </div>
    </file>
    <file name="style.css">
      .keyboard-selected {
        background: yellow;
      }
    </file>
    <file name="example.js">
      angular.module('example', ['angular-keyboard']).controller('ctrl', function ($scope) {
        $scope.as = ['1', '2', '3'];
      });
    </file>
   </example>
 */
angular.module('angular-keyboard').directive('keyboardSelectable', function (KeyboardShortcuts, $timeout) {
  var selectedIndex = 0;
  var elements = [];
  
  var select = function () {
    elements.removeClass('keyboard-selected');
    angular.element(elements[selectedIndex]).addClass('keyboard-selected');
  }
  
  return {
    
    restrict: 'A',
    
    controller: function () {
      
    },
    
    link: function (scope, element, attrs) {
      $timeout(function () {
        elements = element.find('[ng-repeat]')
        select();
      });
      KeyboardShortcuts.register('Select next', attrs.selectNext, function () {
        selectedIndex += 1;
        if (selectedIndex === elements.length) {
          selectedIndex = 0;
        }
        select();
      });
      KeyboardShortcuts.register('Select previous', attrs.selectNext, function () {
        selectedIndex += 1;
        if (selectedIndex === elements.length) {
          selectedIndex = 0;
        }
        select();
      });
    }
    
  };
  
});