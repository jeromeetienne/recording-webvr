var THREEx = THREEx || {}

THREEx.VRPlayer = function(){
        this.vrExperience = null
        this._playbackRate = 1

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
        var videoElement = document.createElement('video')
        videoElement.src = this.path + this.vrExperience.videoSrc 
        videoElement.style.position = 'absolute'
        videoElement.style.top = '0px'
        videoElement.style.zIndex = '-1'
        videoElement.muted = true
        videoElement.playbackRate = this._playbackRate
        document.body.appendChild(videoElement)
        _this.videoElement = videoElement

        // // start gamepadPlayer
        // video.play();
        // 
        // // start video after
	// setTimeout(function(){
        //         _this._gamepadPlayer.start()
	// }, 0.05*1000)

        videoElement.currentTime = 0        
        videoElement.play();
	setTimeout(function(){
        	_this._gamepadPlayer.start()
	}, _this.vrExperience.deltaTime*1000)

	// polyfill to high-jack gamepad API
	navigator.getGamepads = function(){
		return _this._gamepadPlayer.gamepads
	}
        
        return this
}

THREEx.VRPlayer.prototype.isStarted = function () {
        return this._gamepadPlayer.isStarted()
};

THREEx.VRPlayer.prototype.setCurrentTime = function (currentTime) {
        this.videoElement.currentTime = currentTime
        this._gamepadPlayer.currentTime = currentTime - this.vrExperience.deltaTime
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
