/**
 * @ngdoc directive
 * @name angular-keyboard.directive:keyboardHelp
 * @restrict EA
 * @scope true
 * @description
   Displays a formatted table of the currently active keyboard shortcuts. The directives that define these shortcuts need to be loaded in the current view.

  The HTML that this directive generates (for styling purposes) looks like this:
  <pre>
  <table>
    <tr>
      <td><kbd>&#x2325;</kbd> <kbd>S</kbd></td>
      <td>Save the document</td>
    </tr>
    <tr>
      <td><kbd>g</kbd> <span class="keyboard-separator">&#8250;</span> <kbd>i</kbd></td>
      <td>Go to issues</td>
    </tr>
  </table>
  </pre>

  The keybinding are formatted via the {@link angular-keyboard.filter:keybinding keybinding} filter.
 * @example
  <example module="example">
    <file name="index.html">
    <div ng-controller="ctrl">
      <h1>{{state}}</h1>
      <p>
        <a ng-click="decrease()" keyboard-shortcut="shift+down" 
           keyboard-title="Decrease the value">&#8595;</a>
        <a ng-click="increase()" keyboard-shortcut="up" keyboard-prevent-default
           keyboard-title="Increase the value">&#8593;</a>
      </p>
    </div>
    <keyboard-help></keyboard-help>
    </file>
    <file name="style.css">
      kbd {
          -moz-border-radius:3px;
          -moz-box-shadow:0 1px 0 rgba(0,0,0,0.2),0 0 0 2px #fff inset;
          -webkit-border-radius:3px;
          -webkit-box-shadow:0 1px 0 rgba(0,0,0,0.2),0 0 0 2px #fff inset;
          background-color:#f7f7f7;
          border:1px solid #ccc;
          border-radius:3px;
          box-shadow:0 1px 0 rgba(0,0,0,0.2),0 0 0 2px #fff inset;
          color:#333;
          display:inline-block;
          font-family:Arial,Helvetica,sans-serif;
          font-size:11px;
          line-height:1.4;
          margin:0 .1em;
          padding:.1em .6em;
          text-shadow:0 1px 0 #fff;
      }
      tr>td:first-child {
        text-align: right;
        padding: 5px;
      }
    </file>
    <file name="example.js">
      angular.module('example', ['angular-keyboard']).controller('ctrl', function ($scope) {
        $scope.state = 0;
        $scope.increase = function () { $scope.state += 1; };
        $scope.decrease = function () { $scope.state -= 1; };
      });
    </file>
   </example>
 */
angular.module('angular-keyboard').directive('keyboardHelp', function (KeyboardShortcuts) {
  
  return {
    
    restrict: 'EA',
    
    template: '<table>' +
      '<tr ng-repeat="shortcut in shortcuts">' +
        '<td ng-bind-html="shortcut.keybinding | keybinding:true"></td>' +
        '<td>{{shortcut.name}}</td>' +
      '</tr>' +
    '</table>',
    
    scope: true,

    link: function (scope, element, attrs) {
      scope.$watch(function () {
        return KeyboardShortcuts.actions();
      }, function (newValue) {
        scope.shortcuts = newValue;
      });
    }
    
  }
  
});