/**
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
