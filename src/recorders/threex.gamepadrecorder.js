var THREEx = THREEx || {}

THREEx.GamepadRecorder = function(){
        THREEx.JsonRecorder.call( this, function fetchNewRecord(newRecord){
                var gamepads = navigator.getGamepads();
                // clone the struct
                // cloneObject Needed because in chrome, gamepad struct doesnt support JSON.parse(JSON.stringify(data))
                var gamepadsJSON = THREEx.GamepadRecorder._cloneObject(gamepads)
                return gamepadsJSON
        });
        
        this.autoSaveBaseName = 'gamepadrecords'
        
        return
}

THREEx.GamepadRecorder.prototype = Object.create( THREEx.JsonRecorder.prototype );
THREEx.GamepadRecorder.prototype.constructor = THREEx.GamepadRecorder;

// from http://stackoverflow.com/a/4460624
// Needed because gamepad struct doesnt support JSON.parse(JSON.stringify(data))
THREEx.GamepadRecorder._cloneObject = function(item) {
        var _this = this

        if (!item) { return item; } // null, undefined values check
        
        var types = [ Number, String, Boolean ], 
        result;
        
        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        types.forEach(function(type) {
                if (item instanceof type) {
                        result = type( item );
                }
        });
        
        if (typeof result == "undefined") {
                if (Object.prototype.toString.call( item ) === "[object Array]") {
                        result = [];
                        item.forEach(function(child, index, array) { 
                                result[index] = _this._cloneObject( child );
                        });
                } else if (typeof item == "object") {
                        // testing that this is DOM
                        if (item.nodeType && typeof item.cloneNode == "function") {
                                var result = item.cloneNode( true );    
                        } else if (!item.prototype) { // check that this is a literal
                                if (item instanceof Date) {
                                        result = new Date(item);
                                } else {
                                        // it is an object literal
                                        result = {};
                                        for (var i in item) {
                                                result[i] = _this._cloneObject( item[i] );
                                        }
                                }
                        } else {
                                // depending what you would like here,
                                // just keep the reference, or create new object
                                if (false && item.constructor) {
                                        // would not advice to do that, reason? Read below
                                        result = new item.constructor();
                                } else {
                                        result = item;
                                }
                        }
                } else {
                        result = item;
                }
        }
        
        return result;
}
