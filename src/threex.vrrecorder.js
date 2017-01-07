var THREEx = THREEx || {}

THREEx.VRRecorder = function(options){
        options = options || {}
        options.gamepad = options.gamepad !== undefined ? options.gamepad : true
        options.webvr = options.webvr !== undefined ? options.webvr : true
        
        this._isStarted = false
        
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

/**
 * start recording
 */
THREEx.VRRecorder.prototype.start = function () {
        var _this = this
        this._isStarted = true
        
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
            			console.error('No devices available able to present.');
        			return;
        		}
                        // start _webvrRecorder
                        _this._webvrRecorder.setVRDisplay(vrDisplay)
                        _this._webvrRecorder.start()                        
                })                
        }
}

/**
 * stop recording
 */
THREEx.VRRecorder.prototype.stop = function () {
        this._isStarted = false
        // stop _webvrRecorder
        if( this._webvrRecorder ){
                this._webvrRecorder.setVRDisplay(null)
                this._webvrRecorder.stop()                
        }
        // stop _gamepadRecorder
        if( this._gamepadRecorder ){
                this._gamepadRecorder.stop()        
        }

        // build a vrExperience for this recording and download it
        var vrExperience = {
                "videoSrc" : "/your/video/file/goeshere.m4v",
                "camera" : {
                        "position" : [0,0,0],
                        "quaternion" : [0,0,0,1]
                },
                "nWebvrFiles" : this._webvrRecorder ? this._webvrRecorder.autoSaveCounter : 0,
                "videoToWebvrDelay" : 0,
                "webvrBaseUrl" : "webvrrecords",

                "nGamepadFiles" : this._gamepadRecorder ? this._gamepadRecorder.autoSaveCounter : 0,
                "videoToGamepadDelay" : 0,
                "gamepadBaseUrl" : "gamepadrecords"
        }
        var jsonString = JSON.stringify(vrExperience, null, "\t");
        download(jsonString, 'vr-experience.json', 'application/json');
}
THREEx.VRRecorder.prototype.isStarted = function () {
        return this._isStarted
}
