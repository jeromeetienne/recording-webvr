var THREEx = THREEx || {}

THREEx.WebvrRecorder = function(){
        var _this = this
        THREEx.JsonRecorder.call( this, function fetchNewRecord(newRecord){
                _this._vrDisplay.getFrameData(frameData);
// console.log('store webvr framedata', frameData.pose.position)
                var frameDataJSON = JSON.parse(JSON.stringify(frameData))
                return frameDataJSON
        });

        this.autoSaveBaseName = 'webvrrecords'
	var frameData = new VRFrameData()
        
        this._vrDisplay = null
        this.setVRDisplay = function(vrDisplay){
                this._vrDisplay = vrDisplay
                return this
        }
}

THREEx.WebvrRecorder.prototype = Object.create( THREEx.JsonRecorder.prototype );
THREEx.WebvrRecorder.prototype.constructor = THREEx.WebvrRecorder;
