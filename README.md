angular-keyboard
================

angular-keyboard is a user interface toolkit for adding declaratively keyboard navigation to your web apps.

Please see the docs for more information.

Features
--------

- Simple and declarative definition of keyboard shortcuts
- `mod` shorcut transforms to `command` on OSX and to `control` on other platforms
- Support for GMail style keyboard shortcut sequences
- Automatically generate help screen for currently available shortcuts
- Use the API to define shortcuts dynamically in your code
- Support for keyboard selection on collections and shortcuts for acting on current selection

Usage
-----

There is a number of ways to use angular-keyboard, but the simplest is probably to use the declarative approach:

~~~html
<a ng-click="goToPreferences()" keyboard-shortcut="control+,">Preferences</a>
~~~

If the user presses `control ,`, the `goToPreferences` function will be invoked.

You can add 

~~~html
<keyboard-help></keyboard-help>
~~~

and this will be transformed into a user visible screen that shows the currently accessible keyboard shortcuts.

Kudos
-----

The initial code was written by [Jakub Hampl](http://gampleman.eu).

The code relies on the [Mousetrap library](https://github.com/ccampbell/mousetrap) by [Craig Campbell](http://craig.is/).


License
-------

The MIT License (MIT)

Copyright (c) 2014 RightScale

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
