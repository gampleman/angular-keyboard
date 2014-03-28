/**
 * @ngdoc filter
 * @name angular-keyboard.filter:keybinding
 * @function
 * @param {string} input The string representing the keybinding.
 * @param {boolean=} useHTML Set this flag to `true` if you are using `ng-bind-html` to bind the output, as it will output proper `<kbd>` tags.
 * @returns {string} A UTF-8 string with special characters replaced and character sequences represented by arrows or a `$sce` trusted string representing the same in acii HTML.
 * @description
   Formats a keybinding string into a user accessible string.
 * @example
  <example module="example">
    <file name="index.html">
      {{'command+a' | keybinding}}
      <div ng-bind-html="'control+alt+delete' | keybinding:true"></div>
      <p>Konami Code: {{'up up down down left right left right b a' | keybinding}}</p>
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
    </file>
    <file name="example.js">
      angular.module('example', ['angular-keyboard']);
    </file>
   </example>
 */
angular.module('angular-keyboard').filter('keybinding', function ($sce) {

  var map = function (arr, cb) {
    var newArr = [];
    angular.forEach(arr, function (el, ind) {
      newArr.push(cb(el, ind));
    });
    return newArr;
  };
  
  var keyMap = {
    'enter': '&#x23ce;',
    'return': '&#x23ce;',
    'command': '&#x2318;',
    'option': '&#x2325;',
    'alt': '&#x2325;',
    'shift': '&#x21E7;',
    'esc': '&#x238B;',
    'delete': '&#x232b;',
    'backspace': '&#x232b;',
    'left': '&#8592;',
    'right': '&#8594;',
    'up': '&#8593;',
    'down': '&#8595;',
    'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
  };
  
  var utfKeyMap = {
    'enter': '⏎',
    'return': '⏎',
    'command': '⌘',
    'option': '⌥',
    'alt': '⌥',
    'shift': '⇧',
    'esc': '⎋',
    'delete': '⌫',
    'backspace': '⌫',
    'left': '←',
    'right': '→',
    'up': '↑',
    'down': '↓',
    'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
  }
  
  return function(input, HTML) {
    if (HTML) {
      return $sce.trustAsHtml(map(input.split(/\s+/), function (seqMember) {
        return map(seqMember.split('+'), function (key) {
          var keyRep = keyMap[key] ? keyMap[key] : key.toUpperCase();
          return '<kbd>' + keyRep + '</kbd>';
        }).join('');
      }).join(' <span class="keyboard-separator">&#8250;</span> '));
    } else {
      return map(input.split(/\s+/), function (seqMember) {
        return map(seqMember.split('+'), function (key) {
          var keyRep = utfKeyMap[key] ? utfKeyMap[key] : key.toUpperCase();
          return keyRep;
        }).join('');
      }).join(' › ');
    }
  };
});