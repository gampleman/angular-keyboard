/**
 * angular-keyboard 
 * @license MIT License http://opensource.org/licenses/MIT
 */
/*global define:false */
/**
 * Copyright 2013 Craig Campbell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Mousetrap is a simple keyboard shortcut library for Javascript with
 * no external dependencies
 *
 * @version 1.4.6
 * @url craig.is/killing/mice
 */
(function(window, document, undefined) {

    /**
     * mapping of special keycodes to their corresponding keys
     *
     * everything in this dictionary cannot use keypress events
     * so it has to be here to map to the correct keycodes for
     * keyup/keydown events
     *
     * @type {Object}
     */
    var _MAP = {
            8: 'backspace',
            9: 'tab',
            13: 'enter',
            16: 'shift',
            17: 'ctrl',
            18: 'alt',
            20: 'capslock',
            27: 'esc',
            32: 'space',
            33: 'pageup',
            34: 'pagedown',
            35: 'end',
            36: 'home',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            45: 'ins',
            46: 'del',
            91: 'meta',
            93: 'meta',
            224: 'meta'
        },

        /**
         * mapping for special characters so they can support
         *
         * this dictionary is only used incase you want to bind a
         * keyup or keydown event to one of these keys
         *
         * @type {Object}
         */
        _KEYCODE_MAP = {
            106: '*',
            107: '+',
            109: '-',
            110: '.',
            111 : '/',
            186: ';',
            187: '=',
            188: ',',
            189: '-',
            190: '.',
            191: '/',
            192: '`',
            219: '[',
            220: '\\',
            221: ']',
            222: '\''
        },

        /**
         * this is a mapping of keys that require shift on a US keypad
         * back to the non shift equivelents
         *
         * this is so you can use keyup events with these keys
         *
         * note that this will only work reliably on US keyboards
         *
         * @type {Object}
         */
        _SHIFT_MAP = {
            '~': '`',
            '!': '1',
            '@': '2',
            '#': '3',
            '$': '4',
            '%': '5',
            '^': '6',
            '&': '7',
            '*': '8',
            '(': '9',
            ')': '0',
            '_': '-',
            '+': '=',
            ':': ';',
            '\"': '\'',
            '<': ',',
            '>': '.',
            '?': '/',
            '|': '\\'
        },

        /**
         * this is a list of special strings you can use to map
         * to modifier keys when you specify your keyboard shortcuts
         *
         * @type {Object}
         */
        _SPECIAL_ALIASES = {
            'option': 'alt',
            'command': 'meta',
            'return': 'enter',
            'escape': 'esc',
            'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
        },

        /**
         * variable to store the flipped version of _MAP from above
         * needed to check if we should use keypress or not when no action
         * is specified
         *
         * @type {Object|undefined}
         */
        _REVERSE_MAP,

        /**
         * a list of all the callbacks setup via Mousetrap.bind()
         *
         * @type {Object}
         */
        _callbacks = {},

        /**
         * direct map of string combinations to callbacks used for trigger()
         *
         * @type {Object}
         */
        _directMap = {},

        /**
         * keeps track of what level each sequence is at since multiple
         * sequences can start out with the same sequence
         *
         * @type {Object}
         */
        _sequenceLevels = {},

        /**
         * variable to store the setTimeout call
         *
         * @type {null|number}
         */
        _resetTimer,

        /**
         * temporary state where we will ignore the next keyup
         *
         * @type {boolean|string}
         */
        _ignoreNextKeyup = false,

        /**
         * temporary state where we will ignore the next keypress
         *
         * @type {boolean}
         */
        _ignoreNextKeypress = false,

        /**
         * are we currently inside of a sequence?
         * type of action ("keyup" or "keydown" or "keypress") or false
         *
         * @type {boolean|string}
         */
        _nextExpectedAction = false;

    /**
     * loop through the f keys, f1 to f19 and add them to the map
     * programatically
     */
    for (var i = 1; i < 20; ++i) {
        _MAP[111 + i] = 'f' + i;
    }

    /**
     * loop through to map numbers on the numeric keypad
     */
    for (i = 0; i <= 9; ++i) {
        _MAP[i + 96] = i;
    }

    /**
     * cross browser add event method
     *
     * @param {Element|HTMLDocument} object
     * @param {string} type
     * @param {Function} callback
     * @returns void
     */
    function _addEvent(object, type, callback) {
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
            return;
        }

        object.attachEvent('on' + type, callback);
    }

    /**
     * takes the event and returns the key character
     *
     * @param {Event} e
     * @return {string}
     */
    function _characterFromEvent(e) {

        // for keypress events we should return the character as is
        if (e.type == 'keypress') {
            var character = String.fromCharCode(e.which);

            // if the shift key is not pressed then it is safe to assume
            // that we want the character to be lowercase.  this means if
            // you accidentally have caps lock on then your key bindings
            // will continue to work
            //
            // the only side effect that might not be desired is if you
            // bind something like 'A' cause you want to trigger an
            // event when capital A is pressed caps lock will no longer
            // trigger the event.  shift+a will though.
            if (!e.shiftKey) {
                character = character.toLowerCase();
            }

            return character;
        }

        // for non keypress events the special maps are needed
        if (_MAP[e.which]) {
            return _MAP[e.which];
        }

        if (_KEYCODE_MAP[e.which]) {
            return _KEYCODE_MAP[e.which];
        }

        // if it is not in the special map

        // with keydown and keyup events the character seems to always
        // come in as an uppercase character whether you are pressing shift
        // or not.  we should make sure it is always lowercase for comparisons
        return String.fromCharCode(e.which).toLowerCase();
    }

    /**
     * checks if two arrays are equal
     *
     * @param {Array} modifiers1
     * @param {Array} modifiers2
     * @returns {boolean}
     */
    function _modifiersMatch(modifiers1, modifiers2) {
        return modifiers1.sort().join(',') === modifiers2.sort().join(',');
    }

    /**
     * resets all sequence counters except for the ones passed in
     *
     * @param {Object} doNotReset
     * @returns void
     */
    function _resetSequences(doNotReset) {
        doNotReset = doNotReset || {};

        var activeSequences = false,
            key;

        for (key in _sequenceLevels) {
            if (doNotReset[key]) {
                activeSequences = true;
                continue;
            }
            _sequenceLevels[key] = 0;
        }

        if (!activeSequences) {
            _nextExpectedAction = false;
        }
    }

    /**
     * finds all callbacks that match based on the keycode, modifiers,
     * and action
     *
     * @param {string} character
     * @param {Array} modifiers
     * @param {Event|Object} e
     * @param {string=} sequenceName - name of the sequence we are looking for
     * @param {string=} combination
     * @param {number=} level
     * @returns {Array}
     */
    function _getMatches(character, modifiers, e, sequenceName, combination, level) {
        var i,
            callback,
            matches = [],
            action = e.type;

        // if there are no events related to this keycode
        if (!_callbacks[character]) {
            return [];
        }

        // if a modifier key is coming up on its own we should allow it
        if (action == 'keyup' && _isModifier(character)) {
            modifiers = [character];
        }

        // loop through all callbacks for the key that was pressed
        // and see if any of them match
        for (i = 0; i < _callbacks[character].length; ++i) {
            callback = _callbacks[character][i];

            // if a sequence name is not specified, but this is a sequence at
            // the wrong level then move onto the next match
            if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
                continue;
            }

            // if the action we are looking for doesn't match the action we got
            // then we should keep going
            if (action != callback.action) {
                continue;
            }

            // if this is a keypress event and the meta key and control key
            // are not pressed that means that we need to only look at the
            // character, otherwise check the modifiers as well
            //
            // chrome will not fire a keypress if meta or control is down
            // safari will fire a keypress if meta or meta+shift is down
            // firefox will fire a keypress if meta or control is down
            if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {

                // when you bind a combination or sequence a second time it
                // should overwrite the first one.  if a sequenceName or
                // combination is specified in this call it does just that
                //
                // @todo make deleting its own method?
                var deleteCombo = !sequenceName && callback.combo == combination;
                var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
                if (deleteCombo || deleteSequence) {
                    _callbacks[character].splice(i, 1);
                }

                matches.push(callback);
            }
        }

        return matches;
    }

    /**
     * takes a key event and figures out what the modifiers are
     *
     * @param {Event} e
     * @returns {Array}
     */
    function _eventModifiers(e) {
        var modifiers = [];

        if (e.shiftKey) {
            modifiers.push('shift');
        }

        if (e.altKey) {
            modifiers.push('alt');
        }

        if (e.ctrlKey) {
            modifiers.push('ctrl');
        }

        if (e.metaKey) {
            modifiers.push('meta');
        }

        return modifiers;
    }

    /**
     * prevents default for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _preventDefault(e) {
        if (e.preventDefault) {
            e.preventDefault();
            return;
        }

        e.returnValue = false;
    }

    /**
     * stops propogation for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _stopPropagation(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
            return;
        }

        e.cancelBubble = true;
    }

    /**
     * actually calls the callback function
     *
     * if your callback function returns false this will use the jquery
     * convention - prevent default and stop propogation on the event
     *
     * @param {Function} callback
     * @param {Event} e
     * @returns void
     */
    function _fireCallback(callback, e, combo, sequence) {

        // if this event should not happen stop here
        if (Mousetrap.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
            return;
        }

        if (callback(e, combo) === false) {
            _preventDefault(e);
            _stopPropagation(e);
        }
    }

    /**
     * handles a character key event
     *
     * @param {string} character
     * @param {Array} modifiers
     * @param {Event} e
     * @returns void
     */
    function _handleKey(character, modifiers, e) {
        var callbacks = _getMatches(character, modifiers, e),
            i,
            doNotReset = {},
            maxLevel = 0,
            processedSequenceCallback = false;

        // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
        for (i = 0; i < callbacks.length; ++i) {
            if (callbacks[i].seq) {
                maxLevel = Math.max(maxLevel, callbacks[i].level);
            }
        }

        // loop through matching callbacks for this key event
        for (i = 0; i < callbacks.length; ++i) {

            // fire for all sequence callbacks
            // this is because if for example you have multiple sequences
            // bound such as "g i" and "g t" they both need to fire the
            // callback for matching g cause otherwise you can only ever
            // match the first one
            if (callbacks[i].seq) {

                // only fire callbacks for the maxLevel to prevent
                // subsequences from also firing
                //
                // for example 'a option b' should not cause 'option b' to fire
                // even though 'option b' is part of the other sequence
                //
                // any sequences that do not match here will be discarded
                // below by the _resetSequences call
                if (callbacks[i].level != maxLevel) {
                    continue;
                }

                processedSequenceCallback = true;

                // keep a list of which sequences were matches for later
                doNotReset[callbacks[i].seq] = 1;
                _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
                continue;
            }

            // if there were no sequence matches but we are still here
            // that means this is a regular match so we should fire that
            if (!processedSequenceCallback) {
                _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
            }
        }

        // if the key you pressed matches the type of sequence without
        // being a modifier (ie "keyup" or "keypress") then we should
        // reset all sequences that were not matched by this event
        //
        // this is so, for example, if you have the sequence "h a t" and you
        // type "h e a r t" it does not match.  in this case the "e" will
        // cause the sequence to reset
        //
        // modifier keys are ignored because you can have a sequence
        // that contains modifiers such as "enter ctrl+space" and in most
        // cases the modifier key will be pressed before the next key
        //
        // also if you have a sequence such as "ctrl+b a" then pressing the
        // "b" key will trigger a "keypress" and a "keydown"
        //
        // the "keydown" is expected when there is a modifier, but the
        // "keypress" ends up matching the _nextExpectedAction since it occurs
        // after and that causes the sequence to reset
        //
        // we ignore keypresses in a sequence that directly follow a keydown
        // for the same character
        var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;
        if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
            _resetSequences(doNotReset);
        }

        _ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
    }

    /**
     * handles a keydown event
     *
     * @param {Event} e
     * @returns void
     */
    function _handleKeyEvent(e) {

        // normalize e.which for key events
        // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
        if (typeof e.which !== 'number') {
            e.which = e.keyCode;
        }

        var character = _characterFromEvent(e);

        // no character found then stop
        if (!character) {
            return;
        }

        // need to use === for the character check because the character can be 0
        if (e.type == 'keyup' && _ignoreNextKeyup === character) {
            _ignoreNextKeyup = false;
            return;
        }

        Mousetrap.handleKey(character, _eventModifiers(e), e);
    }

    /**
     * determines if the keycode specified is a modifier key or not
     *
     * @param {string} key
     * @returns {boolean}
     */
    function _isModifier(key) {
        return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
    }

    /**
     * called to set a 1 second timeout on the specified sequence
     *
     * this is so after each key press in the sequence you have 1 second
     * to press the next key before you have to start over
     *
     * @returns void
     */
    function _resetSequenceTimer() {
        clearTimeout(_resetTimer);
        _resetTimer = setTimeout(_resetSequences, 1000);
    }

    /**
     * reverses the map lookup so that we can look for specific keys
     * to see what can and can't use keypress
     *
     * @return {Object}
     */
    function _getReverseMap() {
        if (!_REVERSE_MAP) {
            _REVERSE_MAP = {};
            for (var key in _MAP) {

                // pull out the numeric keypad from here cause keypress should
                // be able to detect the keys from the character
                if (key > 95 && key < 112) {
                    continue;
                }

                if (_MAP.hasOwnProperty(key)) {
                    _REVERSE_MAP[_MAP[key]] = key;
                }
            }
        }
        return _REVERSE_MAP;
    }

    /**
     * picks the best action based on the key combination
     *
     * @param {string} key - character for key
     * @param {Array} modifiers
     * @param {string=} action passed in
     */
    function _pickBestAction(key, modifiers, action) {

        // if no action was picked in we should try to pick the one
        // that we think would work best for this key
        if (!action) {
            action = _getReverseMap()[key] ? 'keydown' : 'keypress';
        }

        // modifier keys don't work as expected with keypress,
        // switch to keydown
        if (action == 'keypress' && modifiers.length) {
            action = 'keydown';
        }

        return action;
    }

    /**
     * binds a key sequence to an event
     *
     * @param {string} combo - combo specified in bind call
     * @param {Array} keys
     * @param {Function} callback
     * @param {string=} action
     * @returns void
     */
    function _bindSequence(combo, keys, callback, action) {

        // start off by adding a sequence level record for this combination
        // and setting the level to 0
        _sequenceLevels[combo] = 0;

        /**
         * callback to increase the sequence level for this sequence and reset
         * all other sequences that were active
         *
         * @param {string} nextAction
         * @returns {Function}
         */
        function _increaseSequence(nextAction) {
            return function() {
                _nextExpectedAction = nextAction;
                ++_sequenceLevels[combo];
                _resetSequenceTimer();
            };
        }

        /**
         * wraps the specified callback inside of another function in order
         * to reset all sequence counters as soon as this sequence is done
         *
         * @param {Event} e
         * @returns void
         */
        function _callbackAndReset(e) {
            _fireCallback(callback, e, combo);

            // we should ignore the next key up if the action is key down
            // or keypress.  this is so if you finish a sequence and
            // release the key the final key will not trigger a keyup
            if (action !== 'keyup') {
                _ignoreNextKeyup = _characterFromEvent(e);
            }

            // weird race condition if a sequence ends with the key
            // another sequence begins with
            setTimeout(_resetSequences, 10);
        }

        // loop through keys one at a time and bind the appropriate callback
        // function.  for any key leading up to the final one it should
        // increase the sequence. after the final, it should reset all sequences
        //
        // if an action is specified in the original bind call then that will
        // be used throughout.  otherwise we will pass the action that the
        // next key in the sequence should match.  this allows a sequence
        // to mix and match keypress and keydown events depending on which
        // ones are better suited to the key provided
        for (var i = 0; i < keys.length; ++i) {
            var isFinal = i + 1 === keys.length;
            var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
            _bindSingle(keys[i], wrappedCallback, action, combo, i);
        }
    }

    /**
     * Converts from a string key combination to an array
     *
     * @param  {string} combination like "command+shift+l"
     * @return {Array}
     */
    function _keysFromString(combination) {
        if (combination === '+') {
            return ['+'];
        }

        return combination.split('+');
    }

    /**
     * Gets info for a specific key combination
     *
     * @param  {string} combination key combination ("command+s" or "a" or "*")
     * @param  {string=} action
     * @returns {Object}
     */
    function _getKeyInfo(combination, action) {
        var keys,
            key,
            i,
            modifiers = [];

        // take the keys from this pattern and figure out what the actual
        // pattern is all about
        keys = _keysFromString(combination);

        for (i = 0; i < keys.length; ++i) {
            key = keys[i];

            // normalize key names
            if (_SPECIAL_ALIASES[key]) {
                key = _SPECIAL_ALIASES[key];
            }

            // if this is not a keypress event then we should
            // be smart about using shift keys
            // this will only work for US keyboards however
            if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                key = _SHIFT_MAP[key];
                modifiers.push('shift');
            }

            // if this key is a modifier then add it to the list of modifiers
            if (_isModifier(key)) {
                modifiers.push(key);
            }
        }

        // depending on what the key combination is
        // we will try to pick the best event for it
        action = _pickBestAction(key, modifiers, action);

        return {
            key: key,
            modifiers: modifiers,
            action: action
        };
    }

    /**
     * binds a single keyboard combination
     *
     * @param {string} combination
     * @param {Function} callback
     * @param {string=} action
     * @param {string=} sequenceName - name of sequence if part of sequence
     * @param {number=} level - what part of the sequence the command is
     * @returns void
     */
    function _bindSingle(combination, callback, action, sequenceName, level) {

        // store a direct mapped reference for use with Mousetrap.trigger
        _directMap[combination + ':' + action] = callback;

        // make sure multiple spaces in a row become a single space
        combination = combination.replace(/\s+/g, ' ');

        var sequence = combination.split(' '),
            info;

        // if this pattern is a sequence of keys then run through this method
        // to reprocess each pattern one key at a time
        if (sequence.length > 1) {
            _bindSequence(combination, sequence, callback, action);
            return;
        }

        info = _getKeyInfo(combination, action);

        // make sure to initialize array if this is the first time
        // a callback is added for this key
        _callbacks[info.key] = _callbacks[info.key] || [];

        // remove an existing match if there is one
        _getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level);

        // add this call back to the array
        // if it is a sequence put it at the beginning
        // if not put it at the end
        //
        // this is important because the way these are processed expects
        // the sequence ones to come first
        _callbacks[info.key][sequenceName ? 'unshift' : 'push']({
            callback: callback,
            modifiers: info.modifiers,
            action: info.action,
            seq: sequenceName,
            level: level,
            combo: combination
        });
    }

    /**
     * binds multiple combinations to the same callback
     *
     * @param {Array} combinations
     * @param {Function} callback
     * @param {string|undefined} action
     * @returns void
     */
    function _bindMultiple(combinations, callback, action) {
        for (var i = 0; i < combinations.length; ++i) {
            _bindSingle(combinations[i], callback, action);
        }
    }

    // start!
    _addEvent(document, 'keypress', _handleKeyEvent);
    _addEvent(document, 'keydown', _handleKeyEvent);
    _addEvent(document, 'keyup', _handleKeyEvent);

    var Mousetrap = {

        /**
         * binds an event to mousetrap
         *
         * can be a single key, a combination of keys separated with +,
         * an array of keys, or a sequence of keys separated by spaces
         *
         * be sure to list the modifier keys first to make sure that the
         * correct key ends up getting bound (the last key in the pattern)
         *
         * @param {string|Array} keys
         * @param {Function} callback
         * @param {string=} action - 'keypress', 'keydown', or 'keyup'
         * @returns void
         */
        bind: function(keys, callback, action) {
            keys = keys instanceof Array ? keys : [keys];
            _bindMultiple(keys, callback, action);
            return this;
        },

        /**
         * unbinds an event to mousetrap
         *
         * the unbinding sets the callback function of the specified key combo
         * to an empty function and deletes the corresponding key in the
         * _directMap dict.
         *
         * TODO: actually remove this from the _callbacks dictionary instead
         * of binding an empty function
         *
         * the keycombo+action has to be exactly the same as
         * it was defined in the bind method
         *
         * @param {string|Array} keys
         * @param {string} action
         * @returns void
         */
        unbind: function(keys, action) {
            return Mousetrap.bind(keys, function() {}, action);
        },

        /**
         * triggers an event that has already been bound
         *
         * @param {string} keys
         * @param {string=} action
         * @returns void
         */
        trigger: function(keys, action) {
            if (_directMap[keys + ':' + action]) {
                _directMap[keys + ':' + action]({}, keys);
            }
            return this;
        },

        /**
         * resets the library back to its initial state.  this is useful
         * if you want to clear out the current keyboard shortcuts and bind
         * new ones - for example if you switch to another page
         *
         * @returns void
         */
        reset: function() {
            _callbacks = {};
            _directMap = {};
            return this;
        },

       /**
        * should we stop this event before firing off callbacks
        *
        * @param {Event} e
        * @param {Element} element
        * @return {boolean}
        */
        stopCallback: function(e, element) {

            // if the element has the class "mousetrap" then no need to stop
            if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
                return false;
            }

            // stop for input, select, and textarea
            return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
        },

        /**
         * exposes _handleKey publicly so it can be overwritten by extensions
         */
        handleKey: _handleKey
    };

    // expose mousetrap to the global object
    window.Mousetrap = Mousetrap;

    // expose mousetrap as an AMD module
    if (typeof define === 'function' && define.amd) {
        define(Mousetrap);
    }
}) (window, document);
;/**
 * @ngdoc overview
 * @name angular-keyboard
 * @description
# angular-keyboard

This module is designed to make it easy to declare keyboard shortcuts in your app. This overview section goes through some of the basic concepts.

## Keyboard shortcuts

Keyboard shortcuts in angular-keyboard are strings with a particular syntax. Most characters represent themselves, however special characters are represented by names of the relevant key.

For modifier keys you can use `shift`, `ctrl`, `alt`, `option`, `meta`, and `command`.

Other special keys are `backspace`, `tab`, `enter`, `return`, `capslock`, `esc`, `escape`, `space`, `pageup`, `pagedown`, `end`, `home`, `left`, `up`, `right`, `down`, `ins`, and `del`.

Finally the special `mod` key represents `command` on OS X and `ctrl` on Windows and Linux.

Combinations of keys are created by listing individual keys separated by `+`. E.g. `ctrl+alt+del` is the infamous shortcut of pressing simultaneously the control, alt and delete keys.

Sequences on the other hand require the user to press keys one after the other in short intervals. Sequences are created by separating keys by spaces. So `g i` would trigger if a user presses the `g` key and follows by pressing the `i` key.

## Reading the docs

The most straightforward to use is the {@link angular-keyboard.directive:keyboardShortcut keyboardShortcut} directive. This directive allows you to enhance your already existing HTML with keyboard navigation. {@link angular-keyboard.directive:keyboardHelp keyboardHelp} shows the feature of showing all accessible keyboard shortcuts. {@link angular-keyboard.directive:keyboardSelectable keyboardSelectable} is a more advanced directive that is used for manipulating collections.

Finally the {@link angular-keyboard.service:KeyboardShortcuts KeyboardShortcuts} service will allow to dynamically add keyboard shortcut interactions to your own custom components.

 */
angular.module('angular-keyboard', ['ng']);
;/**
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
angular.module('angular-keyboard').service('KeyboardShortcuts', ['$timeout', function ($timeout) {
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
}]);;/**
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
 * @param {string=} keyboardCategory  If used, this will group shortcuts into categories in the {@link angular-keyboard.directive:keyboardHelp keyboardHelp} directive.
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
angular.module('angular-keyboard').directive('keyboardShortcut', ['KeyboardShortcuts', '$filter', function (KeyboardShortcuts, $filter) {
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

      if ('keyboardCategory' in attrs) {
        options.category = attrs.keyboardCategory;
      }

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
}]);
