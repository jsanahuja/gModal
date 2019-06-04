/**
 * Modal
 * A modal library made with raw js
 * 
 * @version 1.0
 * 
 * @author Javier Sanahuja <bannss1@gmail.com>
 * 
 */
var Modal = (function(){
    var defaults = {
        title: "Default modal title",
        body: "This is the default body. It can include <strong>html</strong> or leave it empty to be hidden.",
        buttons: [
            {
                content: "Cancel",
                classes: "modal-button-gray",
                bindKey: 27, //Escape. See https://keycode.info/
                // bindKey: false,
                callback: function(modal){
                    alert("You clicked CANCEL!");
                    modal.hide();
                }
            },{
                content: "Accept",
                classes: "modal-button-blue",
                bindKey: 13, //Enter. See https://keycode.info/
                callback: function(modal){
                    alert("You clicked ACCEPT!");
                    modal.hide();
                }
            }
        ],
        close: {
            closable: true,
            location: "in", //in or out (side) the modal
            bindKey: 27,    //Key 27 is already in use. This will throw a warning!!
            callback: function(modal){
                alert("You used the close functionality!");
                modal.hide();
            }
        },

        onShow:     function(modal){},
        onHide:     function(modal){ modal.destroy(); },
        onCreate:   function(modal){},
        onDestroy:  function(modal){}
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
    function getClasses(el){
        return el.className.split(" ").filter(function(c){ return c.length > 0; });
    }

    function hasClass(el, className){
        return getClasses(el).indexOf(className) >= 0;
    }

    function addClass(el, className){
        if(!hasClass(el, className)){
            el.className += " "+ className;
        }
    }

    function removeClass(el, className){
        if(hasClass(el, className)){
            var classes = getClasses(el);
            classes.splice(classes.indexOf(className), 1);
            el.className = classes.join(" ");
        }
    }

    function onKeyPress(e){
        if(!this.display)
            return;
        var keyCode = e.keyCode || e.which;
        var keys = Object.keys(this.bindings);
        for(var i = 0; i < keys.length; i++){
            if(keys[i] == keyCode){
                e.preventDefault();
                e.stopPropagation();
                this.bindings[keys[i]](this);
                return false;
            }
        }
    }

    function bind(key, callback){
        if(typeof this.bindings[key] !== "undefined")
            console.warn("Modal: Tried to bind the key "+ key +" twice. Overriding...");
        this.bindings[key] = callback;
    }

    function addKeyListener(){
        this.addEventListener("keydown", onKeyPress, false);
    }

    function removeKeyListener(){
        this.removeEventListener("keydown", onKeyPress, false);
    }


    function Modal(options, id){
        this.id = id || Math.random().toString(36).substr(2);
        this.options = Object.assign({}, defaults, options);
        this.display = false;
        this.bindings = {};

        this.show = function(){
            if(typeof this.wrapper !== "undefined"){
                addClass(this.wrapper, "modal-active");
                addClass(document.body, "modal-active");
                this.display = true;
                this.options.onShow(this);
            }
        };

        this.hide = function(){
            if(typeof this.wrapper !== "undefined"){
                removeClass(this.wrapper, "modal-active");
                removeClass(document.body, "modal-active");
                this.display = false;
                this.options.onHide(this);
            }
        };

        this.create = function(){
            if(typeof this.wrapper !== "undefined"){
                return;
            }
            var backdrop, dialog;

            this.wrapper = document.createElement("div");
            this.wrapper.className = "modal-wrapper";
            this.wrapper.id = "modal-wrapper-" + this.id;

            backdrop = document.createElement("div");
            backdrop.className = "modal-backdrop";

            dialog = document.createElement("div");
            dialog.className = "modal-dialog";

            if(typeof this.options.close.closable !== "undefined" && this.options.close.closable){
                var close = document.createElement("a");
                close.setAttribute("href", "javascript:void(0);");

                if(typeof this.options.close.callback === "undefined")
                    this.options.close.callback = function(){};

                //close button click
                close.modal = this;
                close.callback = this.options.close.callback;
                close.onclick = function(e){
                    e.preventDefault();
                    e.stopPropagation()
                    this.callback(this.modal);
                    return false;
                }

                //close key binding
                if(typeof this.options.close.bindKey === "number"){
                    bind(this.options.close.bindKey, this.options.close.callback);
                }
                
                if(typeof this.options.close.location === "undefined" || this.options.close.location == "in"){
                    close.className = "modal-close-in";
                    dialog.appendChild(close);
                }else{
                    close.className = "modal-close-out";
                    backdrop.appendChild(close);
                }
            }

            if(this.options.title != ""){
                var title = document.createElement("div");
                title.className = "modal-title";
                title.innerHTML = this.options.title;
                dialog.appendChild(title);
            }

            if(this.options.body != ""){
                var body = document.createElement("div");
                body.className = "modal-body";
                body.innerHTML = this.options.body;
                dialog.appendChild(body);
            }

            if(this.options.buttons.length > 0){
                var buttons = document.createElement("div");
                buttons.className = "modal-buttons";

                for(var i = 0; i < this.options.buttons.length; i++){
                    var button = document.createElement("a");
                    button.setAttribute("href", "javascript:void(0);");

                    button.className = "modal-button";
                    if(typeof this.options.buttons[i].classes !== "undefined")
                        button.className += " " + this.options.buttons[i].classes;

                    if(typeof this.options.buttons[i].content !== "undefined")
                        button.innerHTML = this.options.buttons[i].content;

                    if(typeof this.options.buttons[i].callback === "undefined")
                        this.options.buttons[i].callback = function(){};
                    
                    //button click
                    button.modal = this;
                    button.callback = this.options.buttons[i].callback;
                    button.onclick = function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        this.callback(this.modal);
                        return false;
                    };

                    //button key binding
                    if(typeof this.options.buttons[i].bindKey !== "undefined"){
                        bind(this.options.buttons[i].bindKey, this.options.buttons[i].callback);
                    }

                    buttons.appendChild(button);
                }
                dialog.appendChild(buttons);
            }
            this.wrapper.appendChild(backdrop);
            this.wrapper.appendChild(dialog);
            document.body.appendChild(this.wrapper);

            addKeyListener();
            this.options.onCreate(this);
        };

        this.destroy = function(){
            if(typeof this.wrapper !== "undefined"){
                document.body.removeChild(this.wrapper);
                this.wrapper = undefined;
                removeKeyListener();
                this.options.onDestroy(this);
            }
        };

        this.create();
        return this;
    }

    return Modal;
})();