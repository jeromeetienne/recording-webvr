var THREEx = THREEx || {}

THREEx.VRRecorder = function(options){
        options = options || {}
        options.gamepad = options.gamepad !== undefined ? options.gamepad : true
        options.webvr = options.webvr !== undefined ? options.webvr : true
        
        // build gamepadRecorder
        if( options.gamepad === true ){
                this._gamepadRecorder = new THREEx.GamepadRecorder()                
        }else{
                this._gamepadRecorder = null
        }

        // build WebvrRecorder
        if( options.webvr === true ){
                this._webvrRecorder = new THREEx.WebvrRecorder()
        }else{
                this._webvrRecorder = null
        }
}

THREEx.VRRecorder.prototype.start = function () {
        var _this = this
        
        // start gamepadRecorder
        if( _this._gamepadRecorder !== null ){
                _this._gamepadRecorder.start()
        }    

        if( _this._webvrRecorder !== null ){
                navigator.getVRDisplays().then(function(displays){
                        var vrDisplay = null
                        // get vrDisplay
                        for(var i = 0; i < displays.length; i++){
                                if( displays[i].capabilities.canPresent === false )     continue
                                vrDisplay = displays[i]
                                break
                        }
        		// If there are no devices available, quit out.
        		if (vrDisplay === null) {
            			console.warn('No devices available able to present.');
        			return;
        		}
        console.log('vrDisplay', vrDisplay)
                        // start _webvrRecorder
                        _this._webvrRecorder.setVRDisplay(vrDisplay)
                        _this._webvrRecorder.start()                        
                })                
        }
}

THREEx.VRRecorder.prototype.stop = function () {
        if( this._webvrRecorder ){
                this._webvrRecorder.setVRDisplay(null)
                this._webvrRecorder.stop()                
        }

        if( this._gamepadRecorder ){
                this._gamepadRecorder.stop()        
        }
}

