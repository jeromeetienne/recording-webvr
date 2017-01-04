var THREEx = THREEx || {}

THREEx.VRPlayer = function(){
        this.vrExperience = null
        this._playbackRate = 1

        // build video element
        this.videoElement = document.createElement('video')
        this.videoElement.style.position = 'absolute'
        this.videoElement.style.top = '0px'
        this.videoElement.style.zIndex = '-1'
        this.videoElement.muted = true
        this.videoElement.playbackRate = this._playbackRate
        document.body.appendChild(this.videoElement)

        // build gamepadPlayer
        this._gamepadPlayer = new THREEx.GamepadPlayer()
        this._gamepadPlayer.playbackRate = this._playbackRate
}

/**
 * set playbackRate
 */
THREEx.VRPlayer.prototype.setPlaybackRate = function(playbackRate){
        this._playbackRate = playbackRate
        this._gamepadPlayer.playbackRate = playbackRate
        this.videoElement.playbackRate = playbackRate
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
        	var urls = []
        	for(var i = 0; i < _this.vrExperience.nGamepadFiles; i++){
        		urls.push( _this.path + _this.vrExperience.gamepadBaseUrl+pad(i, 4)+'.json')
        	}
        	// start loading those urls
                _this._gamepadPlayer.load(urls, function(){
                        onLoaded()
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
        document.body.appendChild(this.videoElement)

        // // start gamepadPlayer
        // video.play();
        // 
        // // start video after
	// setTimeout(function(){
        //         _this._gamepadPlayer.start()
	// }, 0.05*1000)

        _this._gamepadPlayer.start()
	setTimeout(function(){
                _this.videoElement.currentTime = 0        
                _this.videoElement.play();
	}, _this.vrExperience.videoToGamepadDelay*1000)

	// polyfill to high-jack gamepad API
	navigator.getGamepads = function(){
		return _this._gamepadPlayer.gamepads
	}
        
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
        
        this._gamepadPlayer.currentTime = currentTime - this.vrExperience.videoToGamepadDelay
        this._gamepadPlayer.onCurrentTimeChange()
}

THREEx.VRPlayer.prototype.seek = function (delta) {
        var currentTime = this.videoElement.currentTime
        currentTime += delta
        this.setCurrentTime(currentTime)
}

THREEx.VRPlayer.prototype.pause = function (value) {
        
        if( value === undefined ){
                value = this._gamepadPlayer.paused ? false : true
        }
        
        this._gamepadPlayer.pause(value)
        if( value === true ){
                this.videoElement.pause()
        }else{
                if( this.videoElement.paused ){
                        this.videoElement.play()
                }
        }
}

THREEx.VRPlayer.prototype.update = function (deltaTime) {
        this._gamepadPlayer.update(deltaTime)
};
