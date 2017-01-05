var THREEx = THREEx || {}

THREEx.VRRecorder = function(){
        // build gamepadRecorder
        this._gamepadRecorder = new THREEx.GamepadRecorder()
        // build WebvrRecorder
        this._webvrRecorder = new THREEx.WebvrRecorder()
}

THREEx.VRRecorder.prototype.start = function () {
        this._gamepadRecorder.start()
        
        this._webvrRecorder.start()
}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

THREEx.VRRecorder.start = function(){
	var vrRecorder = new THREEx.VRRecorder()
        vrRecorder.start()
        return vrRecorder
}
