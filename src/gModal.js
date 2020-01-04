/**
 * gModal
 * A modal library made with raw js
 *
 * @version 2.0.0
 *
 * @license MIT
 *
 * @author Javier Sanahuja <bannss1@gmail.com>
 *
 * https://github.com/jsanahuja/gModal
 */
var gModal = (function() {
    var defaults = {
        title: 'Default gModal title',
        body:
            'This is the default body. It can include <strong>html</strong>. ' +
            'You can also leave it empty so we will hide it :).',
        buttons: [
            /* No buttons by default.
                        {
                                content: "Cancel",
                                classes: "gmodal-button-gray",
                                // bindKey: 27, <- This would throw a warning because we're
                                                   using the same key for closing.
                                bindKey: false,
                                callback: function(modal){
                                        alert("You clicked CANCEL!");
                                        modal.hide();
                                }
                        },{
                                content: "Accept",
                                classes: "gmodal-button-blue",
                                bindKey: 13, //Enter. See https://keycode.info/
                                callback: function(modal){
                                        alert("You clicked ACCEPT!");
                                        modal.hide();
                                }
                        }
            */
        ],
        close: {
            closable: true,
            location: 'in',
            bindKey: 27,
            callback: function(modal) {
                modal.hide();
            }
        },

        onShow: function(modal) {},
        onHide: function(modal) {
            modal.destroy();
        },
        onCreate: function(modal) {},
        onDestroy: function(modal) {}
    };

    /** Object.assign polyfill **/
    if (typeof Object.assign != 'function') {
        Object.assign = function(target) {
            'use strict';
            if (target == null) {
                throw new TypeError('Cannot convert undefined or null to object');
            }

            target = Object(target);
            for (var index = 1; index < arguments.length; index++) {
                var source = arguments[index];
                if (source != null) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }
            }
            return target;
        };
    }

    /**
         * PRIVATE METHODS
         */
    function getClasses(el) {
        return el.className.split(' ').filter(function(c) {
            return c.length > 0;
        });
    }

    function hasClass(el, className) {
        return getClasses(el).indexOf(className) >= 0;
    }

    function addClass(el, className) {
        if (!hasClass(el, className)) {
            el.className += ' ' + className;
        }
    }

    function removeClass(el, className) {
        if (hasClass(el, className)) {
            var classes = getClasses(el);
            classes.splice(classes.indexOf(className), 1);
            el.className = classes.join(' ');
        }
    }

    var gModal = function(options, id) {
        this.id = id || Math.random().toString(36).substr(2);
        this.options = Object.assign({}, defaults, options);
        // this will fix options.close unwanted overrides
        if (typeof options !== 'undefined' && typeof options.close !== 'undefined') {
            this.options.close = Object.assign({}, defaults.close, options.close);
        }
        this.display = false;
        this.bindings = {};

        this.bind = function(key, callback) {
            if (typeof this.bindings[key] !== 'undefined') {
                console.warn('gModal: Tried to bind the key ' + key + ' twice. Overriding...');
            }
            this.bindings[key] = callback;
        };

        this.addKeyListener = function() {
            window.currentModal = this;
            window.addEventListener('keydown', this.onKeyPress, false);
        };

        this.removeKeyListener = function() {
            window.currentModal = undefined;
            window.removeEventListener('keydown', this.onKeyPress, false);
        };

        this.onKeyPress = function(e) {
            if (
                typeof window.currentModal !== 'undefined' &&
                window.currentModal instanceof gModal
            ) {
                var _that = window.currentModal;
                if (!_that.display) return;
                var keyCode = e.keyCode || e.which;
                var keys = Object.keys(_that.bindings);
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i] === keyCode) {
                        e.preventDefault();
                        e.stopPropagation();
                        _that.bindings[keys[i]](_that);
                        return false;
                    }
                }
            }
        };

        this.show = function() {
            if (typeof this.wrapper !== 'undefined') {
                addClass(this.wrapper, 'gmodal-active');
                addClass(document.body, 'gmodal-active');
                this.display = true;
                this.options.onShow(this);
            }
        };

        this.hide = function() {
            if (typeof this.wrapper !== 'undefined') {
                removeClass(this.wrapper, 'gmodal-active');
                removeClass(document.body, 'gmodal-active');
                this.display = false;
                this.options.onHide(this);
            }
        };

        this.create = function() {
            if (typeof this.wrapper !== 'undefined') {
                return;
            }
            var backdrop, dialog;

            this.wrapper = document.createElement('div');
            this.wrapper.className = 'gmodal-wrapper';
            this.wrapper.id = 'gmodal-wrapper-' + this.id;

            backdrop = document.createElement('div');
            backdrop.className = 'gmodal-backdrop';

            dialog = document.createElement('div');
            dialog.className = 'gmodal-dialog';

            if (typeof this.options.close.closable !== 'undefined' && this.options.close.closable) {
                var close = document.createElement('a');
                close.setAttribute('href', 'javascript:void(0);');

                if (typeof this.options.close.callback === 'undefined') {
                    this.options.close.callback = function() {};
                }

                // close button click
                close.modal = this;
                close.callback = this.options.close.callback;
                close.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.callback(this.modal);
                    return false;
                };

                // close key binding
                if (typeof this.options.close.bindKey === 'number') {
                    this.bind(this.options.close.bindKey, this.options.close.callback);
                }

                if (
                    typeof this.options.close.location === 'undefined' ||
                    this.options.close.location == 'in'
                ) {
                    close.className = 'gmodal-close-in';
                    dialog.appendChild(close);
                } else {
                    close.className = 'gmodal-close-out';
                    backdrop.appendChild(close);
                }
            }

            if (this.options.title != '') {
                var title = document.createElement('div');
                title.className = 'gmodal-title';
                title.innerHTML = this.options.title;
                dialog.appendChild(title);
            }

            if (this.options.body != '') {
                var body = document.createElement('div');
                body.className = 'gmodal-body';
                body.innerHTML = this.options.body;
                dialog.appendChild(body);
            }

            if (this.options.buttons.length > 0) {
                var buttons = document.createElement('div');
                buttons.className = 'gmodal-buttons';

                for (var i = 0; i < this.options.buttons.length; i++) {
                    var button = document.createElement('a');
                    button.setAttribute('href', 'javascript:void(0);');

                    button.className = 'gmodal-button';
                    if (typeof this.options.buttons[i].classes !== 'undefined') {
                        button.className += ' ' + this.options.buttons[i].classes;
                    }

                    if (typeof this.options.buttons[i].content !== 'undefined') {
                        button.innerHTML = this.options.buttons[i].content;
                    }

                    if (typeof this.options.buttons[i].callback === 'undefined') {
                        this.options.buttons[i].callback = function(modal) {
                            modal.hide();
                        };
                    }

                    // button click
                    button.modal = this;
                    button.callback = this.options.buttons[i].callback;
                    button.onclick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        this.callback(this.modal);
                        return false;
                    };

                    // button key binding
                    if (typeof this.options.buttons[i].bindKey === 'number') {
                        this.bind(
                            this.options.buttons[i].bindKey,
                            this.options.buttons[i].callback
                        );
                    }

                    buttons.appendChild(button);
                }
                dialog.appendChild(buttons);
            }
            this.wrapper.appendChild(backdrop);
            this.wrapper.appendChild(dialog);
            document.body.appendChild(this.wrapper);

            this.addKeyListener();
            this.options.onCreate(this);
        };

        this.destroy = function() {
            if (typeof this.wrapper !== 'undefined') {
                document.body.removeChild(this.wrapper);
                this.wrapper = undefined;
                this.removeKeyListener();
                this.options.onDestroy(this);
            }
        };

        this.create();
        return this;
    };

    return gModal;
})();
