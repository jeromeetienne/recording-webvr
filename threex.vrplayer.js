var THREEx = THREEx || {}

THREEx.VRPlayer = function(){
        this.vrExperience = null
        this._gamepadPlayer = new THREEx.GamepadPlayer()
}


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


THREEx.VRPlayer.prototype.start = function(){
        var _this = this
        // build video element
        var video = document.createElement('video')
        video.src = this.path + this.vrExperience.videoSrc 
        video.style.position = 'absolute'
        video.style.top = '0px'
        video.style.zIndex = '-1'
        video.muted = true
        document.body.appendChild(video)

        // start gamepadPlayer
	_this._gamepadPlayer.start()

        // start video after
	setTimeout(function(){
		video.play();
	}, _this.vrExperience.deltaTime*1000)

	// polyfill to high-jack gamepad API
	navigator.getGamepads = function(){
		return _this._gamepadPlayer.gamepads
	}
        
        return this
}
