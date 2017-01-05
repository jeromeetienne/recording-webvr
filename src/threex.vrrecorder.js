var THREEx = THREEx || {}

THREEx.VRRecorder = function(){
        // build gamepadRecorder
        this._gamepadRecorder = new THREEx.GamepadRecorder()
        // build WebvrRecorder
        this._webvrRecorder = new THREEx.WebvrRecorder()
}

THREEx.VRRecorder.prototype.start = function () {
        var _this = this
console.log('ss')
	navigator.getVRDisplays().then(function(displays){
console.log('ddd')
                var vrDisplay = null
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
                _this._webvrRecorder.setVRDisplay(vrDisplay)
                _this._webvrRecorder.start()
                
                _this._gamepadRecorder.start()        
        })
}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

THREEx.VRRecorder.start = function(){
	var vrRecorder = new THREEx.VRRecorder()
        vrRecorder.start()
        return vrRecorder
}
