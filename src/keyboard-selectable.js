/**
 * @ngdoc directive
 * @name angular-keyboard.directive:keyboardSelectable
 * @restrict A
 * @description
 * Used for performing keyboard actions on lists of items. It must be specified on the parent element as ng-repeat and exposes another scope variable to it's elements: `keyboardSelected` which is a boolean indicating selection on the particular class.

To trigger keyboard shortcuts only on the selected element, use {@link angular-keyboard.directive:keyboardShortcut keyboardShortcut's} `selection-shortcut` option to make it work only on the selected element.
 * @param {string=} keyboardSelectable The name of the kind of thing being selected. This, unless `privateShortcut` is set will cause two entries to be added to the {@link angular-keyboard.directive:keyboardHelp keyboard shorcuts list}: 'Select next {{keyboardSelectable}}' and 'Select previous {{keyboardSelectable}}'.
 * @param {string=} selectedClass The css class used to establish selection. Defaults to `keyboard-selected`.
 * @param {string=} selectNext The keybinding string that will select the next element in the collection.
 * @param {string=} selectPrevious The keybinding string that will select the previous element in the collection.
 * @param {boolean=} keyboardPreventDefault Prevents the default keyboard action.
 * @param {boolean=} privateShortcut Hides the shortcut from the {@link angular-keyboard.directive:keyboardHelp keyboardHelp} directive and from exposure in {@link angular-keyboard.service:KeyboardShortcuts KeyboardShortcuts.actions()}. 
 * @param {string|Function(element, collection) =} selectionAction This attribute decides what to do on selection. The default value, `'class'` will remove the `selectedClass` from all other elements in the `collection` and add it to the selected `element`. Another string value `'click()'` will send a click event on selection to the `element`. You can specify a css selector between the brackets and the click event will be sent to any children of the `element` matching the selector (e.g. `'click(a.link)'`). Finally you may provide a custom function with this functionality.
 * @example
  <example module="example">
    <file name="index.html">
    <div ng-controller="ctrl">
      <div keyboard-selectable="list item" select-next="down" select-previous="up" keyboard-prevent-default>
        <!-- start with a selection of 2 -->
        <div ng-repeat="a in as" ng-class="{'keyboard-selected': $index == 1}">
          <a keyboard-shortcut="space"  ng-click="tell(a)"
            selection-shortcut keyboard-title="Select list item">{{a}}</a>
        </div>
      </div>
      <h4>Keyboard Shortcuts</h4>
      <keyboard-help></keyboard-help>
    </div>
    </file>
    <file name="style.css">
      .keyboard-selected {
        background: yellow;
      }
    </file>
    <file name="example.js">
      angular.module('example', ['angular-keyboard']).controller('ctrl', function ($scope) {
        $scope.as = ['1', '2', '3', '4'];
        $scope.tell = function (el) {
          alert('You selected number ' + el);
        };
      });
    </file>
   </example>
 */
angular.module('angular-keyboard').directive('keyboardSelectable', function (KeyboardShortcuts, $timeout) {
  var selectedIndex = 0
    , elements = []
    , selectedClass
    , callbacks = {}
    , selectionAction;
  
  var select = function () {
    var m;
    if (selectionAction === 'class') {
      elements.removeClass(selectedClass);
      angular.element(elements[selectedIndex]).addClass(selectedClass);
    } else if (angular.isString(selectionAction) && (m = selectionAction.match(/click\((.*?)\)/))) {
      if (m[1] === '') {
        $(elements[selectedIndex]).click();
      } else {
        $(elements[selectedIndex]).find(m[1]).click();
      }
    } else if (angular.isFunction(selectionAction)) {
      selectionAction(elements[selectedIndex], elements);
    }
    
    angular.forEach(callbacks, function (kbs, keybinding) {
      angular.forEach(kbs, function (settings) {
        KeyboardShortcuts.remove(settings.name, keybinding);
      });
      var k = kbs[selectedIndex.toString()];
      KeyboardShortcuts.register(k.name, keybinding, k.action, k.options);
    });
  }
  
  return {
    
    restrict: 'A',
    
    controller: function () {
      return {
        register: function (index, name, keybinding, action, options) {
          callbacks[keybinding] = callbacks[keybinding] || {};
          callbacks[keybinding][index.toString()] = {
            name: name, keybinding: keybinding, action: action, options: options
          };
        },
        
        remove: function (index, name, keybinding) {
          delete callbacks[keybinding][index.toString()];
        }
      }
    },
    
    link: function (scope, element, attrs) {
      function setup () {
        function getSelection(collection) {
          (function _checker() {
            elements = element.find('[ng-repeat]');
            if (collection.length !== elements.length) {
              $timeout(_checker, 100);
              return;
            }
            // let's find the initial selection
            selectedClass = attrs.selectedClass || 'keyboard-selected';
            selectedIndex = elements.index(elements.filter('.' + selectedClass));
            if (selectedIndex < 0) { selectedIndex = 0; }
            select();
          })();
        }
        elements = element.find('[ng-repeat]');
        if (elements.length === 0) {
          // ng-repeat not yet loaded
          $timeout(setup, 100);
        } else {
          var match = elements.attr('ng-repeat').match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
        
          scope.$watchCollection(match[2], getSelection);
        }
      }
      $timeout(setup, 100);
      
      selectionAction = attrs.selectionAction ? scope.$eval(attrs.selectionAction) : 'class';
      
      var options = {
        preventDefault: attrs.keyboardPreventDefault === "" || attrs.keyboardPreventDefault === "true" || attrs.keyboardPreventDefault === "keyboard-prevent-default",
        private: attrs.privateShortcut === "" || attrs.privateShortcut === "true" || attrs.privateShortcut === "private-shortcut",
      };
      
      var item = attrs.keyboardSelectable || '';
      KeyboardShortcuts.register('Select next ' + item, attrs.selectNext, function () {
        selectedIndex += 1;
        if (selectedIndex === elements.length) {
          selectedIndex = 0;
        }
        select();
      }, options);
      KeyboardShortcuts.register('Select previous ' + item, attrs.selectPrevious, function () {
        selectedIndex -= 1;
        if (selectedIndex < 0) {
          selectedIndex = elements.length - 1;
        }
        select();
      }, options);
      
      scope.$on('$destroy', function () {
        KeyboardShortcuts.remove('Select previous ' + item, attrs.selectPrevious);
        KeyboardShortcuts.remove('Select next ' + item, attrs.selectNext);
        angular.forEach(callbacks, function (kbs, keybinding) {
          angular.forEach(kbs, function (settings) {
            KeyboardShortcuts.remove(settings.name, keybinding);
          });
        });
      });
    }
    
  };
  
});