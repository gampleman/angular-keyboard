/**
 * @ngdoc directive
 * @name angular-keyboard.directive:keyboardShortcut
 * @restrict EA
 * @description
   Registers a keyboard shortcut for the default event for the attached element.

   Use this directive to attach a keyboard shortcut to an element that already has some behavior attached to it:
   <pre>
   <a ng-click="doSomething()" keyboard-shortcut="ctrl+d">Do Something</a>
   </pre>

   This will cause the ctrl+d shortcut to call `doSomething()`.

   There is a variaety of options to customize the behavior.
   
 * @param {string} keyboardShortcut The shortcut that the user needs to enter. See {@link angular-keyboard Keyboard shortcuts} for more details.
 * @param {string=} keyboardTitle A description for the user of what the directive does. 
   This is used in conjuction with the {@link angular-keyboard.directive:keyboardHelp keyboardHelp} directive. Also if the element does 
   not specify a title, this with the keyboard shortcut will become its `title`. 
   Defaults to an elements title or text.
 * @param {string=} keyboardTrigger Specify the event that should be run on the keyboard 
   shortcut. Defaults to the `click` event. This means that attaching shortcuts to links and buttons should just work, but saving forms might need a different event.
 * @param {function=} keyboardAction Action to take when the keyboard shortcut is triggered. 
   Defaults to triggering an event on the element. This allows to only expose functions through the HTML:
   <pre>
   <keyboard-shortcut keyboard-shortcut="mod+s" keyboard-action="save()" keyboard-title="Save the document">
   </keyboard-shortcut>
   </pre>
 * @param {boolean=} keyboardPreventDefault Prevents the default keyboard action.
 * @param {boolean=} privateShortcut Hides the shortcut from the {@link angular-keyboard.directive:keyboardHelp keyboardHelp} directive and from exposure in {@link angular-keyboard.service:KeyboardShortcuts KeyboardShortcuts.actions()}. 
 * @param {boolean=} shortcutIf The keyboard shortcut is only active if the value of the expression is true. 
 * @param {boolean=} selectionShortcut Set this if the shortcut should only apply if the element is selected via {@link angular-keyboard.directive:keyboardSelectable keyboardSelectable}.
 * @example
  <example module="example">
    <file name="index.html">
    <div ng-controller="ctrl">
      <h1>{{state}}</h1>
      <p>
        <a ng-click="decrease()" keyboard-shortcut="shift+down" keyboard-title="Decrease the value">&#8595;</a>
        <a ng-click="increase()" keyboard-shortcut="up" keyboard-prevent-default>&#8593;</a>
      </p>
      <p>Use shift down to decrease and up to increase the value.</p>
    </div>
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
angular.module('angular-keyboard').directive('keyboardShortcut', function (KeyboardShortcuts, $filter) {
  return {
    
    restrict: 'AE',
    
    require: '?^keyboardSelectable',
    
    link: function (scope, element, attrs, ctrl) {
      // taken from angulartics
      function isCommand(element) {
        return ['a:','button:','button:button','button:submit','input:button','input:submit'].indexOf(
          element[0].tagName.toLowerCase()+':'+(element.type||'')) >= 0;
      }

      function inferEventName(element) {
        return element[0].title || element.text() || element.val() || element[0].id || element[0].name || element[0].tagName || element[0].innerText || element[0].value;
      }
      
      var eventName = attrs.keyboardTrigger || 'click';
      
      var callback;
      
      if (attrs.keyboardAction) {
        callback = function () {
          scope.$apply(attrs.keyboardAction);
        };
      } else {
        callback = function () {
          var event; // The custom event that will be created

          if (document.createEvent) {
           event = document.createEvent("HTMLEvents");
           event.initEvent(eventName, true, true);
          } else {
           event = document.createEventObject();
           event.eventType = eventName;
          }

          event.eventName = eventName;

          if (document.createEvent) {
           element[0].dispatchEvent(event);
          } else {
           element[0].fireEvent("on" + event.eventType, event);
          }
        };
      }

      if (attrs.keyboardTitle && !element[0].title) {
        element[0].title = attrs.keyboardTitle + ' (' + $filter('keybinding')(attrs.keyboardShortcut) + ')'
      }
      
      var description = attrs.keyboardTitle || inferEventName(element);
      
      var options = {
        preventDefault: attrs.keyboardPreventDefault === "" || attrs.keyboardPreventDefault === "true" || attrs.keyboardPreventDefault === "keyboard-prevent-default",
        private: attrs.privateShortcut === "" || attrs.privateShortcut === "true" || attrs.privateShortcut === "private-shortcut",
      };
      
      function register() {
        if (attrs.selectionShortcut === "" || attrs.selectionShortcut === "true" || attrs.selectionShortcut === "selection-shortcut") {
          ctrl.register(scope.$index, description, attrs.keyboardShortcut, callback, options);
        } else {
           KeyboardShortcuts.register(description, attrs.keyboardShortcut, callback, options);
        }
      }
      
      function remove() {
        if (attrs.selectionShortcut === "" || attrs.selectionShortcut === "true" || attrs.selectionShortcut === "selection-shortcut") {
          ctrl.remove(scope.$index, description, attrs.keyboardShortcut);
        } else {
           KeyboardShortcuts.remove(description, attrs.keyboardShortcut);
        }
      }
      
      if (attrs.shortcutIf) {
        scope.$watch(attrs.shortcutIf, function (val) {
          if (val) {
            register();
          } else {
            remove();
          }
        })
      } else {
        register();
      }
      
      scope.$on('$destroy', function () {
        remove();
      });
    }
  };
});