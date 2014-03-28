/**
 * @ngdoc object
 * @name angular-keyboard.service:KeyboardShortcuts
 * @description
 * Centrally manages all active Keyboard shortcuts.
 * @example
  <example module="example">
    <file name="index.html">
      <my-dir></my-dir>
    </file>
    <file name="example.js">
      angular.module('example', ['angular-keyboard']).directive('myDir', function (KeyboardShortcuts) {
        return {
          restrict: 'E',
          templateUrl: 'my-dir.html',
          link: function (scope) {
            scope.state = 'Yes';

            // 1. Register the toggle shortcut
            KeyboardShortcuts.register('Toggle', 'alt+t', function () {
              scope.state = (scope.state == 'Yes') ? 'No' : 'Yes';
            }, {digest: true});

            scope.$watch('state', function (val) {
              // 2. Conditionally register and remove shortcuts based on state
              if (val == 'Yes') {
                KeyboardShortcuts.register('Set to No', 'n', function () {
                  scope.state = 'No';
                }, {digest: true});
                KeyboardShortcuts.remove('Set to Yes', 'y');
              } else {
                KeyboardShortcuts.register('Set to Yes', 'y', function () {
                  scope.state = 'Yes';
                }, {digest: true, preventDefault: true});
                KeyboardShortcuts.remove('Set to No', 'n');
              }
            });
            
            // 3. Observe avaialable actions and display them
            scope.$watch(function () {
              return KeyboardShortcuts.actions();
            }, function (val) {
              scope.shortcuts = val;
            });
          }
        };
      });
    </file>
    <file name="my-dir.html">
      <h1>Toggle: {{state}}</h1>
      <p ng-repeat="shortcut in shortcuts">
        {{shortcut.keybinding}} - <a ng-click="shortcut.action()">{{shortcut.name}}</a>
      </p>
    </file>
   </example>
 */
angular.module('angular-keyboard').service('KeyboardShortcuts', function ($timeout) {
  var publicActions = [];
  var actions = [];
  
  var wrapAction = function (action, options) {
    if (options.digest) {
      action = (function(action) { return function () { $timeout(action) } })(action);
    }
    if (options.preventDefault) {
      action = (function(action) { return function(e) {
        action();
        e.preventDefault();
        return false;
      }})(action);
    }
    return action;
  }
  
  return {
    /**
     * @ngdoc method
     * @methodOf angular-keyboard.service:KeyboardShortcuts
     * @name register
     * @description Registers an action for a keyboard shortcut.
     * @param {string} name A user visisble name that describes the action
     * @param {string} keybinding A keybinding string.
     * @param {function} action This function is called when the keybinding is invoked.
     * @param {Object=} options An options object with the following boolean options:
    
       `preventDefault` will prevent the default behavior of the event. So if the 
        action would be a mouse click on a link, the href wouldn't be followed.
        
      `private` This flag will hide the action from {@link angular-keyboard.directive:keyboardHelp the keyboardHelp directive} and from being exposed through the `actions()` method.
    
      `digest` This flag will run the action after the digest cycle completes rather than 
        immediately. Useful when defining actions in custom directives and modifying scope variables in 
        actions.
      * @example
      <pre>
      KeyboardShortcuts.register('Access task manager', 'ctrl+alt+del', function () {
        TaskManager.show();
      }, {
        private: true,
        digest: true
      });
      </pre>
     */
    register: function (name, keybinding, action, options) {
      if (!options) options = {};

      Mousetrap.bind(keybinding, wrapAction(action, options));
      
      if (!options.private) {
        publicActions.push({ name: name, keybinding: keybinding, action: action, options: options });
      }
      
      actions.push({ name: name, keybinding: keybinding, action: action, options: options });
    },
    
    /**
     * @ngdoc method
     * @methodOf angular-keyboard.service:KeyboardShortcuts
     * @name remove
     * @description Un-registers an action from a keyboard shortcut.
     * @param {string} name A user visisble name that describes the action
     * @param {string} keybinding A keybinding string.
     */
    remove: function (name, keybinding) {
      var needsUnbinding = true;
      for (var i = 0; i < publicActions.length; i++) {
        if (publicActions[i].name === name && publicActions[i].keybinding === keybinding) {
          publicActions.splice(i, 1);
          break;
        }
      }
      for (var i = 0; i < actions.length; i++) {
        if (actions[i].name === name && actions[i].keybinding === keybinding) {
          actions.splice(i, 1);
          break;
        }
        if (actions[i].name === name) {
          needsUnbinding = false;
        }
      }
      if (needsUnbinding) {
        Mousetrap.unbind(keybinding);
        
        for (var i = 0; i < actions.length; i++) {
          if (actions[i].keybinding === keybinding) {
            Mousetrap.bind(keybinding, actions[i].action);
          }
        }
      }
    },
    
    /**
     * @ngdoc method
     * @methodOf angular-keyboard.service:KeyboardShortcuts
     * @name actions
     * @description 
       Get all the public currently registered actions. 
       Actions registered with the `private` flag set will not be included.
     * @return {Array} Returns an array of objects with keys coresponding to the parameters of register.
     */
    actions: function () {
      return publicActions;
    }
  }
});