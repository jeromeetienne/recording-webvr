var THREEx = THREEx || {}


THREEx.VRPlayer = function(){
        var _this = this
        this.vrExperience = null
        this._playbackRate = 1

        // build video element
        this.videoElement = document.createElement('video')
        this.videoElement.style.position = 'absolute'
        this.videoElement.style.top = '0px'
        this.videoElement.style.left = '0px'
        this.videoElement.style.zIndex = '-1'
        this.videoElement.muted = true
        this.videoElement.playbackRate = this._playbackRate

        // build webvrPlayer
        this._webvrPlayer = new THREEx.WebvrPlayer()
        this._webvrPlayer.playbackRate = this._playbackRate

        // build gamepadPlayer
        this._gamepadPlayer = new THREEx.GamepadPlayer()
        this._gamepadPlayer.playbackRate = this._playbackRate

	// polyfill to high-jack gamepad API
	navigator.getGamepads = function(){
		return _this._gamepadPlayer.gamepads
	}


        // install webvr-polyfill to replay webvr
        var webvrPolyfill = new WebVRPolyfill().install()
        // to init frameDataProvider immediatly
        var frameDataProvider = new FrameDataProviderWebvr(this._webvrPlayer)
        webvrPolyfill.setFrameDataProvider(frameDataProvider)
}

/**
 * set playbackRate
 */
THREEx.VRPlayer.prototype.setPlaybackRate = function(playbackRate){
        this._playbackRate = playbackRate
        this.videoElement.playbackRate = playbackRate

        this._webvrPlayer.playbackRate = playbackRate
        this._gamepadPlayer.playbackRate = playbackRate
        return this
}

/**
 * Load a vrExperience
 */
THREEx.VRPlayer.prototype.load = function(path, basename, onLoaded){
        var _this = this

        doHttpRequest(path + basename, function(data){
                var vrExperience = JSON.parse(data)
                
                _this.vrExperience = vrExperience
                _this.path = path

                // build the urls of the file to load
        	var webvrUrls = []
        	for(var i = 0; i < _this.vrExperience.nWebvrFiles; i++){
        		webvrUrls.push( _this.path + _this.vrExperience.webvrBaseUrl+pad(i, 4)+'.json')
        	}

                // start loading those urls
                var webvrLoaded = false
                _this._webvrPlayer.load(webvrUrls, function(){
                        webvrLoaded = true
                        if( webvrLoaded && gamepadLoaded )      onLoaded()
                })

                // build the urls of the file to load
        	var gamepadUrls = []
        	for(var i = 0; i < _this.vrExperience.nGamepadFiles; i++){
        		gamepadUrls.push( _this.path + _this.vrExperience.gamepadBaseUrl+pad(i, 4)+'.json')
        	}

        	// start loading those urls
                var gamepadLoaded = false
                _this._gamepadPlayer.load(gamepadUrls, function(){
                        gamepadLoaded = true
                        if( webvrLoaded && gamepadLoaded )      onLoaded()      
                })
        })
        
        return this     // for api chainability
        function doHttpRequest(url, onLoaded){
                var request = new XMLHttpRequest()
                request.addEventListener('load', function(){
                        onLoaded(this.responseText)
                })
                request.open('GET', url)
                request.send()
        }
        function pad(num, size) {
                var string = num + '';
                while (string.length < size) string = '0' + string;
                return string;
        }                
};


/**
 * Start playing the experience
 */
THREEx.VRPlayer.prototype.start = function(){
        var _this = this
        // build video element
        this.videoElement.src = this.path + this.vrExperience.videoSrc 

        this.videoElement.play()
        this._webvrPlayer.start()
        this._gamepadPlayer.start()

        this.setCurrentTime(0)
        
        return this
}

THREEx.VRPlayer.prototype.isStarted = function () {
        return this._gamepadPlayer.isStarted()
};
THREEx.VRPlayer.prototype.isPaused = function () {
        return this._gamepadPlayer.paused
};

THREEx.VRPlayer.prototype.getCurrentTime = function () {
        return this.videoElement.currentTime
}

THREEx.VRPlayer.prototype.setCurrentTime = function (currentTime) {
        this.videoElement.currentTime = currentTime
        
        this._webvrPlayer.currentTime = currentTime - this.vrExperience.videoToWebvrDelay
        this._webvrPlayer.onCurrentTimeChange()
        
        this._gamepadPlayer.currentTime = currentTime - this.vrExperience.videoToGamepadDelay
        this._gamepadPlayer.onCurrentTimeChange()
}

THREEx.VRPlayer.prototype.seek = function (delta) {
        var currentTime = this.videoElement.currentTime
        currentTime += delta
        this.setCurrentTime(currentTime)
}

THREEx.VRPlayer.prototype.pause = function (value) {
        // handle default value        
        if( value === undefined ){
                value = this._gamepadPlayer.paused ? false : true
        }

        // pause videoElement
        if( value === true ){
                this.videoElement.pause()
        }else{
                if( this.videoElement.paused ){
                        this.videoElement.play()
                }
        }

        // pause _webvrPlayer and _gamepadPlayer
        this._webvrPlayer.pause(value)
        this._gamepadPlayer.pause(value)
}

THREEx.VRPlayer.prototype.update = function (deltaTime) {
        this._webvrPlayer.update(deltaTime)
        this._gamepadPlayer.update(deltaTime)
};

//////////////////////////////////////////////////////////////////////////////
//                Code Separator
//////////////////////////////////////////////////////////////////////////////

function FrameDataProviderWebvr(webvrPlayer){
	var _this = this
	_this.started = true;

	this.resetPose = function(){}
	this.dispose = function(){}

        this.updateFrameData = function(dstFrameData){
                // get the srcFrameData
                var srcFrameData = webvrPlayer.frameData
                if( srcFrameData === null ) return

                dstFrameData.timestamp = srcFrameData.timestamp

                copyArray(srcFrameData.leftProjectionMatrix, dstFrameData.leftProjectionMatrix, 16)
                copyArray(srcFrameData.rightProjectionMatrix, dstFrameData.rightProjectionMatrix, 16)
                copyArray(srcFrameData.leftViewMatrix, dstFrameData.leftViewMatrix, 16)
                copyArray(srcFrameData.rightViewMatrix, dstFrameData.rightViewMatrix, 16)

                copyArray(srcFrameData.pose.position, dstFrameData.pose.position, 3)
                copyArray(srcFrameData.pose.orientation, dstFrameData.pose.orientation, 3)
        	
        	// function to copy weirdo array from FrameData                
                function copyArray(srcArray, dstArray, len){
                        for(var i = 0; i < len; i++){
                                dstArray[i] = srcArray[i]
                        }
                }
        }
}
