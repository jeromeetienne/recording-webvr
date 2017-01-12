var WebVRPolyfill = function(){}

WebVRPolyfill.prototype.install = function(){

        var framedataProvider = null
        this.setFrameDataProvider = function(newFrameDataProvider){
                framedataProvider = newFrameDataProvider
        }

        navigator.getVRDisplays = function(){
        	// console.log('navigator.getVRDisplays()')
        	var vrDisplays = [ new VRDisplay() ]
        	return new Promise(function(resolve, reject) {
        		resolve(vrDisplays);
        	})
        }

        window.VRFrameData = function(){
        	var frameData = this
        	// https://w3c.github.io/webvr/#vrframedata
        	this.timestamp = Date.now()

        	this.leftProjectionMatrix = new Float32Array(16)
        	this.leftViewMatrix = new Float32Array(16)
        	this.rightProjectionMatrix = new Float32Array(16)
        	this.rightViewMatrix = new Float32Array(16)

        	// https://w3c.github.io/webvr/#interface-vrpose
        	this.pose = {}
        	this.pose.position = new Float32Array([0,0,0])
        	// this.pose.linearVelocity = new Float32Array([0,0,0])
        	// this.pose.linearAcceleration = new Float32Array([0,0,0])

        	this.pose.orientation = new Float32Array([0, 0, 0, 1])
        	// this.pose.angularVelocity = new Float32Array([0, 0, 0, 1])
        	// this.pose.angularAcceleration = new Float32Array([0, 0, 0, 1])
        }

        window.VREyeParameters = function(whichEye){
        	this.offset = new Float32Array([0,0,0])

        	if( whichEye === 'right' ){
        		this.offset[0]	= + 0.03
        	}else if( whichEye === 'left' ){
        		this.offset[0]	= - 0.03
        	}else{
        		console.assert(false)
        	}

        	this.fieldOfView = { // Deprecated
        		upDegrees : +30,
        		rightDegrees : +30,
        		downDegrees : -30,
        		leftDegrees : -30,
        	}

        	this.renderWidth = window.innerWidth/2
        	this.renderHeight = window.innerHeight
        }

        window.VRDisplay = function(){
        	// https://w3c.github.io/webvr/#interface-vrdisplay
        	this.isConnected = true
        	this.isPresenting = false
        	
        	this.displayId = 0
        	this.displayName = 'Generic WebVR Polyfill'

        	this.depthNear = 0.1
        	this.depthFar = 10000
        	
        	this.capabilities = {	// https://w3c.github.io/webvr/#vrdisplaycapabilities
        		hasPosition : true,
        		hasOrientation : true,
        		hasExternalDisplay : false,
        		canPresent : true,
        		maxLayers : 1,
        	}
        	
          	this.stageParameters = {	// https://w3c.github.io/webvr/#vrstageparameters
        		sittingToStandingTransform : new Float32Array(16),
        		sizeX : 3,
        		sizeY : 3,
        	}
        }

        VRDisplay.prototype.getFrameData = function(frameData){
        	if( !framedataProvider )	return
                framedataProvider.updateFrameData(frameData)
        }

        VRDisplay.prototype.getEyeParameters = function(whichEye){
        	// console.log('getEyeParameters', whichEye)
        	return new VREyeParameters(whichEye)
        }
        	
        VRDisplay.prototype.getPose = function(){	// Deprecated - https://w3c.github.io/webvr/#dom-vrdisplay-getpose
        	console.assert('not yet implemented, Deprecated anyway')
        }
        VRDisplay.prototype.resetPose = function(frameData){
        	console.assert('not yet implemented')
        	if( !framedataProvider )	return
        	framedataProvider.resetPose()
        }

        VRDisplay.prototype.requestAnimationFrame = function(callback){
        	// console.log('requestAnimationFrame')
        	return window.requestAnimationFrame(callback)
        }
        VRDisplay.prototype.cancelAnimationFrame = function(handle){
        	// console.log('cancelAnimationFrame')
        	return window.cancelAnimationFrame(handle)		
        }

        VRDisplay.prototype.getLayers = function(){
        	// console.log('vrDisplay.getLayers() - not yet fully implemented')
        	return []
        }

        VRDisplay.prototype.requestPresent = function(layers){
        	var _this = this
        	this._layers = layers
        	console.log('requestPresent')

        	return new Promise(function(resolve, reject) {
        		loop()
        		
        		return
        		function loop(){
        			if( framedataProvider.started === true ){
        				completed()				
        				return;
        			}
        			setTimeout(loop, 1000/10)
        		}
        		function completed(){
        			_this.isPresenting = true

        			console.log('dispatch vrdisplaypresentchange on requestPresent')
        			// notify event
        			var event = new Event('vrdisplaypresentchange');
        			window.dispatchEvent(event);
        			// resolve promise
        			resolve();			
        		}
        	})
        }

        VRDisplay.prototype.exitPresent = function(){
        	var _this = this
        	console.log('exitPresent')		
        	
        	return new Promise(function(resolve, reject) {
        		_this.isPresenting = false

        		console.log('dispatch vrdisplaypresentchange on exitPresent')
        		// notify event
        		var event = new Event('vrdisplaypresentchange');
        		window.dispatchEvent(event);

        		// resolve exitPresent promise
        		resolve();
        	})
        }
        	
        // https://w3c.github.io/webvr/#dom-vrdisplay-submitframe
        VRDisplay.prototype.submitFrame = function(){
        	// console.log('submitFrame')				
        }
        
        return this
}
var THREEx = THREEx || {}

THREEx.JsonPlayer = function(onNewRecord){
        var _this = this

        _this.records = null
        _this.playbackRate = 1

        ////////////////////////////////////////////////////////////////////////////////
        //          load files
        ////////////////////////////////////////////////////////////////////////////////
        this.currentTime = 0
        this.started = false
        this.paused = false
        this.start = function(){
                console.assert( this.started === false )
                this.started = true
                this.paused = false

                onCurrentTimeChange()
        }
        this.stop = function(){
                this.started = false
                this.paused = false
        }
        this.isStarted = function(){
                return _this.started
        }
        this.pause = function(onOff){
                _this.paused = onOff
        }
        this.update = function(deltaTime){
                if( this.isStarted() === false )      return

                if( _this.paused === false ){
                        _this.currentTime += deltaTime * _this.playbackRate                        
                }
                
                onCurrentTimeChange()
        }
        this.onCurrentTimeChange = onCurrentTimeChange
        return
        
        function onCurrentTimeChange(){
                if( _this.records === null )    return
                var timestamp = _this.records.startedAt + _this.currentTime * 1000
                var values = _this.records.values
                for(var i = 0; i < values.length; i++){
                        if( i + 1 >= values.length ) break;
                        if( values[i+1].recordedAt > timestamp ){
                                // console.log('notify', i)
                                onNewRecord(values[i].data)                
                                break
                        }
                }
        }
}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

/**
 * load the data from urls
 */
THREEx.JsonPlayer.prototype.load = function(urls, onLoaded){
        var _this = this
        loadNextUrl()
        return
        
        function loadNextUrl(){
                // if there is no more urls to load, return now
                if( urls.length === 0 ){
                        onLoaded()
                        return
                }
                // get next url
                var url = urls.shift()
                // load next url
                doHttpRequest(url, function(content){
                        var loadedRecords = JSON.parse(content)
                        if( _this.records === null ){
                                // if this is the first file ot be loaded
                                _this.records = loadedRecords                                        
                        }else{
                                // concatenate the values array of local records and the loaded ones
                                _this.records.values.push.apply(_this.records.values, loadedRecords.values);
                        }
                        
                        loadNextUrl()
                })
        }
        return

        function doHttpRequest(url, onLoaded){
                var request = new XMLHttpRequest()
                request.addEventListener('load', function(){
                        onLoaded(this.responseText)
                })
                request.open('GET', url)
                request.send()
        }
}
var THREEx = THREEx || {}

THREEx.JsonRecorder = function(fetchNewRecord){
        var _this = this
        
        // parameters
        this.autoSave = true
        this.autoSaveMaxLength = 1000
        this.autoSaveBaseName = 'jsonrecords'
        this.updatePeriod = 1000/100
        this.autoSaveCounter = 0


        var records = {
                startedAt : null,
                values : []    
        }

        ////////////////////////////////////////////////////////////////////////////////
        //          Code Separator
        ////////////////////////////////////////////////////////////////////////////////
        var timerId = null
        this.start = function(){
                records.startedAt = Date.now()
                this.autoSaveCounter = 0
                
                console.assert(timerId === null)
                timerId = setInterval(update, _this.updatePeriod)
                return this
        }
        this.stop = function(){
                if( _this.autoSave === true )   autoSave()

                clearInterval(timerId)
                timerId = null
                return this
        }
        return

        function update(){
                var recordData = fetchNewRecord()
                // add this value 
                records.values.push({
                        recordedAt : Date.now(),
                        data : recordData
                })
                // honor autoSave
                if( _this.autoSave === true && records.values.length >= _this.autoSaveMaxLength ){
                        autoSave()
                }
        }
        
        function autoSave(){
                // save records
                var basename = _this.autoSaveBaseName+pad(_this.autoSaveCounter, 4)+'.json'
                var jsonString = JSON.stringify(records, null, "\t"); 
                // var jsonString = JSON.stringify(records); 

                THREEx.JsonRecorder.save(jsonString, basename)
                

                // update _this.autoSaveCounter
                _this.autoSaveCounter++;                
                
                // clear records
                records.startedAt = Date.now()
                records.values = []                
        }
        function pad(num, size) {
                var s = num + '';
                while (s.length < size) s = '0' + s;
                return s;
        }
};

//////////////////////////////////////////////////////////////////////////////
//                Variou save function
//////////////////////////////////////////////////////////////////////////////
/**
 * save file with download.js
 */
THREEx.JsonRecorder.saveDownloadjs = function(data, basename){
        download(data, basename, 'application/json');
}

/**
 * save file on the server
 */
THREEx.JsonRecorder.saveOnServer = function(data, basename){
        console.log('save basename', basename)
        SimpleUpload.save(basename, data)
}

/**
 * the save function for THREEx.JsonRecorder. 
 * intended to be overload by JsonRecorder.saveDownloadjs or JsonRecorder.saveOnServer
 */
// THREEx.JsonRecorder.save = THREEx.JsonRecorder.saveDownloadjs
THREEx.JsonRecorder.save = THREEx.JsonRecorder.saveOnServer
var THREEx = THREEx || {}

THREEx.WebvrPlayer = function(){
        var _this = this
        THREEx.JsonPlayer.call( this , function onNewRecord(frameData){
                _this.frameData = frameData
                // console.log('ddd copy', frameData.leftViewMatrix)
        });
        
        this.frameData = null   // TODO put a fake one
}
THREEx.WebvrPlayer.prototype = Object.create( THREEx.JsonPlayer.prototype );
THREEx.WebvrPlayer.prototype.constructor = THREEx.WebvrPlayer;
var THREEx = THREEx || {}

THREEx.GamepadPlayer = function(){
        var _this = this
        THREEx.JsonPlayer.call( this, function onNewRecord(newRecord){
                _this.gamepads = newRecord                
        });
        
        this.gamepads = [
                null,
                null,
                null,
                null,
        ]
}
THREEx.GamepadPlayer.prototype = Object.create( THREEx.JsonPlayer.prototype );
THREEx.GamepadPlayer.prototype.constructor = THREEx.GamepadPlayer;
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
var THREEx = THREEx || {}

THREEx.VRPlayerUI = function(vrPlayer){
        this.vrPlayer = vrPlayer
        this.domElement = document.createElement('div')
        
        this.domElement.style.fontFamily = 'monospace'
        this.domElement.style.color = 'black'
        this.domElement.style.padding = '0.5em'
        this.domElement.style.margin = '0.5em'
        this.domElement.style.position = 'fixed'
        this.domElement.style.top = '0px'
        this.domElement.style.right = '0px'
        this.domElement.style.zIndex = 9999
        this.domElement.style.borderRadius = '1em'
        this.domElement.style.borderStyle = 'solid'
        this.domElement.style.backgroundColor = 'lightgrey'

        //////////////////////////////////////////////////////////////////////////////
        //                titleElement
        //////////////////////////////////////////////////////////////////////////////
        var titleElement = document.createElement('h2')
        titleElement.innerHTML = 'VRPlayer'
        this.domElement.appendChild(titleElement)

        ////////////////////////////////////////////////////////////////////////////////
        //          start/pause buttom
        ////////////////////////////////////////////////////////////////////////////////
        
        var startButton = document.createElement('button')
        startButton.innerHTML = 'start'
        this.domElement.appendChild(startButton)
        startButton.addEventListener('click', function(){
                vrPlayer.start()
        })

        var pauseButton = document.createElement('button')
        pauseButton.innerHTML = 'pause'
        this.domElement.appendChild(pauseButton)
        pauseButton.addEventListener('click', function(){
                vrPlayer.pause()
        })

        ////////////////////////////////////////////////////////////////////////////////
        //          Code Separator
        ////////////////////////////////////////////////////////////////////////////////
        
        this.domElement.appendChild(document.createElement('br'))

        var seekMinusOneButton = document.createElement('button')
        seekMinusOneButton.innerHTML = 'seek -1sec'
        this.domElement.appendChild(seekMinusOneButton)
        seekMinusOneButton.addEventListener('click', function(){
                vrPlayer.seek(-1)
        })

        
        var seekPlusOneButton = document.createElement('button')
        seekPlusOneButton.innerHTML = 'seek +1sec'
        this.domElement.appendChild(seekPlusOneButton)
        seekPlusOneButton.addEventListener('click', function(){
                vrPlayer.seek(+1)
        })

        ////////////////////////////////////////////////////////////////////////////////
        //          Code Separator
        ////////////////////////////////////////////////////////////////////////////////

        this.domElement.appendChild(document.createElement('br'))

        var labelElement = document.createElement('label')
        labelElement.innerHTML = 'current time : '
        this.domElement.appendChild(labelElement)
        var currentTimeValue = document.createElement('span')
        currentTimeValue.innerHTML = 'n/a'
        labelElement.appendChild(currentTimeValue)

        this.domElement.appendChild(document.createElement('br'))

        var labelElement = document.createElement('label')
        labelElement.innerHTML = 'video duration : '
        this.domElement.appendChild(labelElement)
        var videoDurationValue = document.createElement('span')
        videoDurationValue.innerHTML = 'n/a'
        labelElement.appendChild(videoDurationValue)

        this.domElement.appendChild(document.createElement('br'))                

        //////////////////////////////////////////////////////////////////////////////
        //                Gamepads
        //////////////////////////////////////////////////////////////////////////////

        var labelElement = document.createElement('label')
        labelElement.innerHTML = 'gamepad time offset : '
        this.domElement.appendChild(labelElement)
        var gamepadTimeOffsetValue = document.createElement('span')
        gamepadTimeOffsetValue.innerHTML = 'n/a'
        labelElement.appendChild(gamepadTimeOffsetValue)

        this.domElement.appendChild(document.createElement('br'))

        var labelElement = document.createElement('label')
        labelElement.innerHTML = 'gamepad time offset : '
        this.domElement.appendChild(labelElement)
        var gamepadTimeOffsetInput = document.createElement('input')
        gamepadTimeOffsetInput.size= '4'
        gamepadTimeOffsetInput.innerHTML = 'n/a'
        labelElement.appendChild(gamepadTimeOffsetInput)
        gamepadTimeOffsetInput.addEventListener('change', function(){
                var value = parseFloat(gamepadTimeOffsetInput.value)
                vrPlayer.vrExperience.videoToGamepadDelay = value
                vrPlayer.seek(0)
        })
        this.domElement.appendChild(document.createElement('br'))        
        

        //////////////////////////////////////////////////////////////////////////////
        //                Webvr
        //////////////////////////////////////////////////////////////////////////////
        
        var labelElement = document.createElement('label')
        labelElement.innerHTML = 'webvr time offset : '
        this.domElement.appendChild(labelElement)
        var webvrTimeOffsetValue = document.createElement('span')
        webvrTimeOffsetValue.innerHTML = 'n/a'
        labelElement.appendChild(webvrTimeOffsetValue)

        this.domElement.appendChild(document.createElement('br'))

        var labelElement = document.createElement('label')
        labelElement.innerHTML = 'webvr time offset : '
        this.domElement.appendChild(labelElement)
        var webvrTimeOffsetInput = document.createElement('input')
        webvrTimeOffsetInput.size= '4'
        webvrTimeOffsetInput.innerHTML = 'n/a'
        labelElement.appendChild(webvrTimeOffsetInput)
        webvrTimeOffsetInput.addEventListener('change', function(){
                var value = parseFloat(webvrTimeOffsetInput.value)
                vrPlayer.vrExperience.videoToWebvrDelay = value
                vrPlayer.seek(0)
        })

        this.update = function(){
                if( vrPlayer.isStarted() ){
                        startButton.disabled = true
                }else{
                        startButton.disabled = false                        
                }
                
                currentTimeValue.innerHTML = vrPlayer.getCurrentTime().toFixed(2) + 'sec'
                
                if( vrPlayer.vrExperience !== null ){
                        gamepadTimeOffsetValue.innerHTML = vrPlayer.vrExperience.videoToGamepadDelay
                }
                
                if( vrPlayer.vrExperience !== null ){
                        webvrTimeOffsetValue.innerHTML = vrPlayer.vrExperience.videoToWebvrDelay
                }

                videoDurationValue.innerHTML = vrPlayer.videoElement.duration.toFixed(2) + 'sec'
        }
}
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
                "fixedCamera" : {
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
        THREEx.JsonRecorder.save(jsonString, 'vr-experience.json', 'application/json');
}
THREEx.VRRecorder.prototype.isStarted = function () {
        return this._isStarted
}
var THREEx = THREEx || {}

THREEx.VRRecorderUI = function(vrRecorder){
        this.vrRecorder = vrRecorder
        this.domElement = document.createElement('div')
        
        this.domElement.style.fontFamily = 'monospace'
        this.domElement.style.color = 'black'
        this.domElement.style.padding = '0.5em'
        this.domElement.style.margin = '0.5em'
        this.domElement.style.position = 'fixed'
        this.domElement.style.top = '0px'
        this.domElement.style.right = '0px'
        this.domElement.style.zIndex = 9999
        this.domElement.style.borderRadius = '1em'
        this.domElement.style.borderStyle = 'solid'
        this.domElement.style.backgroundColor = 'lightgrey'

        //////////////////////////////////////////////////////////////////////////////
        //              titleElement
        //////////////////////////////////////////////////////////////////////////////
        var titleElement = document.createElement('h2')
        titleElement.innerHTML = 'VRRecorder'
        this.domElement.appendChild(titleElement)

        ////////////////////////////////////////////////////////////////////////////////
        //          start/stop buttom
        ////////////////////////////////////////////////////////////////////////////////
        
        var startButton = document.createElement('button')
        startButton.innerHTML = 'start'
        this.domElement.appendChild(startButton)
        startButton.addEventListener('click', function(){
                vrRecorder.start()
        })

        var stopButton = document.createElement('button')
        stopButton.innerHTML = 'stop'
        this.domElement.appendChild(stopButton)
        stopButton.addEventListener('click', function(){
                vrRecorder.stop()
        })

        this.update = function(){
                if( vrRecorder.isStarted() ){
                        startButton.disabled = true
                        stopButton.disabled = false
                }else{
                        startButton.disabled = false                        
                        stopButton.disabled = true
                }
        }
}
var VRRecording = VRRecording || {}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

VRRecording.play = function(experienceUrl, onStarted){
        // create vrPlayer
	var vrPlayer = new THREEx.VRPlayer()
        document.body.appendChild(vrPlayer.videoElement)

	// create the vrPlayerUI
	var vrPlayerUI = new THREEx.VRPlayerUI(vrPlayer)
	document.body.appendChild(vrPlayerUI.domElement)
        
        // match experienceUrl
        var matches = experienceUrl.match(/(.*\/)([^\/]+)/)
        var experienceBasename = matches[2]
        var experiencePath = matches[1]

        vrPlayer.load(experiencePath, experienceBasename, function onLoaded(){
                vrPlayer.start()
                
                onStarted && onStarted(vrPlayer)
        })

        
	// TODO put that in vrPlayer itself
	var lastTime = null
	requestAnimationFrame(function render(now) {
		requestAnimationFrame( render );

                var deltaTime = lastTime === null ? 1000/60 : (now-lastTime)
                lastTime = now
		
		if( vrPlayer.isStarted() ){
			vrPlayer.update(deltaTime/1000)				
		}
		vrPlayerUI.update()				
	})

        return vrPlayer
}




////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

VRRecording.record = function(options){
	var vrRecorder = new THREEx.VRRecorder(options)

	// create the vrPlayerUI
	var vrRecorderUI = new THREEx.VRRecorderUI(vrRecorder)
	document.body.appendChild(vrRecorderUI.domElement)
        
	// TODO put that in vrRecorder itself
	requestAnimationFrame(function render() {
                requestAnimationFrame( render );
                
		vrRecorderUI.update()				
	})

        return vrRecorder
};
//download.js v4.2, by dandavis; 2008-2016. [CCBY2] see http://danml.com/download.html for tests/usage
// v1 landed a FF+Chrome compat way of downloading strings to local un-named files, upgraded to use a hidden frame and optional mime
// v2 added named files via a[download], msSaveBlob, IE (10+) support, and window.URL support for larger+faster saves than dataURLs
// v3 added dataURL and Blob Input, bind-toggle arity, and legacy dataURL fallback was improved with force-download mime and base64 support. 3.1 improved safari handling.
// v4 adds AMD/UMD, commonJS, and plain browser support
// v4.1 adds url download capability via solo URL argument (same domain/CORS only)
// v4.2 adds semantic variable names, long (over 2MB) dataURL support, and hidden by default temp anchors
// https://github.com/rndme/download

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.download = factory();
  }
}(this, function () {

	return function download(data, strFileName, strMimeType) {

		var self = window, // this script is only for browsers anyway...
			defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
			mimeType = strMimeType || defaultMime,
			payload = data,
			url = !strFileName && !strMimeType && payload,
			anchor = document.createElement("a"),
			toString = function(a){return String(a);},
			myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
			fileName = strFileName || "download",
			blob,
			reader;
			myBlob= myBlob.call ? myBlob.bind(self) : Blob ;
	  
		if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
			payload=[payload, mimeType];
			mimeType=payload[0];
			payload=payload[1];
		}


		if(url && url.length< 2048){ // if no filename and no mime, assume a url was passed as the only argument
			fileName = url.split("/").pop().split("?")[0];
			anchor.href = url; // assign href prop to temp anchor
		  	if(anchor.href.indexOf(url) !== -1){ // if the browser determines that it's a potentially valid url path:
        		var ajax=new XMLHttpRequest();
        		ajax.open( "GET", url, true);
        		ajax.responseType = 'blob';
        		ajax.onload= function(e){ 
				  download(e.target.response, fileName, defaultMime);
				};
        		setTimeout(function(){ ajax.send();}, 0); // allows setting custom ajax headers using the return:
			    return ajax;
			} // end if valid url?
		} // end if url?


		//go ahead and download dataURLs right away
		if(/^data\:[\w+\-]+\/[\w+\-]+[,;]/.test(payload)){
		
			if(payload.length > (1024*1024*1.999) && myBlob !== toString ){
				payload=dataUrlToBlob(payload);
				mimeType=payload.type || defaultMime;
			}else{			
				return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
					navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
					saver(payload) ; // everyone else can save dataURLs un-processed
			}
			
		}//end if dataURL passed?

		blob = payload instanceof myBlob ?
			payload :
			new myBlob([payload], {type: mimeType}) ;


		function dataUrlToBlob(strUrl) {
			var parts= strUrl.split(/[:;,]/),
			type= parts[1],
			decoder= parts[2] == "base64" ? atob : decodeURIComponent,
			binData= decoder( parts.pop() ),
			mx= binData.length,
			i= 0,
			uiArr= new Uint8Array(mx);

			for(i;i<mx;++i) uiArr[i]= binData.charCodeAt(i);

			return new myBlob([uiArr], {type: type});
		 }

		function saver(url, winMode){

			if ('download' in anchor) { //html5 A[download]
				anchor.href = url;
				anchor.setAttribute("download", fileName);
				anchor.className = "download-js-link";
				anchor.innerHTML = "downloading...";
				anchor.style.display = "none";
				document.body.appendChild(anchor);
				setTimeout(function() {
					anchor.click();
					document.body.removeChild(anchor);
					if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(anchor.href);}, 250 );}
				}, 66);
				return true;
			}

			// handle non-a[download] safari as best we can:
			if(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
				url=url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
				if(!window.open(url)){ // popup blocked, offer direct download:
					if(confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")){ location.href=url; }
				}
				return true;
			}

			//do iframe dataURL download (old ch+FF):
			var f = document.createElement("iframe");
			document.body.appendChild(f);

			if(!winMode){ // force a mime that will download:
				url="data:"+url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
			}
			f.src=url;
			setTimeout(function(){ document.body.removeChild(f); }, 333);

		}//end saver




		if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
			return navigator.msSaveBlob(blob, fileName);
		}

		if(self.URL){ // simple fast and modern way using Blob and URL:
			saver(self.URL.createObjectURL(blob), true);
		}else{
			// handle non-Blob()+non-URL browsers:
			if(typeof blob === "string" || blob.constructor===toString ){
				try{
					return saver( "data:" +  mimeType   + ";base64,"  +  self.btoa(blob)  );
				}catch(y){
					return saver( "data:" +  mimeType   + "," + encodeURIComponent(blob)  );
				}
			}

			// Blob but not URL support:
			reader=new FileReader();
			reader.onload=function(e){
				saver(this.result);
			};
			reader.readAsDataURL(blob);
		}
		return true;
	}; /* end download() */
}));/**
 * 
 */

var SimpleUpload = function(){}

/**
 * the server url - just put your own there
 * @type {String}
 */
SimpleUpload.serverUrl = 'http://127.0.0.1:8000/'

/**
 * save the file
 */
SimpleUpload.save = function (filename, data) {
	var request = new XMLHttpRequest();

	// We define what will happen if the data is successfully sent
	request.addEventListener('load', function(event) {
		// alert('Yeah! Data sent and response loaded.');
		console.log('event load')
	});
	
	// We define what will happen in case of error
	request.addEventListener('error', function(event) {
		// alert('Oups! Something goes wrong.');
		console.log('event error')
	});
	
	// We setup our request
	request.open('POST', SimpleUpload.serverUrl + '?filename='+filename);
	
	// And finally, We send our data.
	var dataJson = JSON.stringify(data)
	request.send(dataJson);
}
window.vrRecordingBookmarklet = function(){}	

vrRecordingBookmarklet.init = function(){	
        var params = vrRecordingBookmarklet._parseParamsInHash()

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
        if( params.mode === 'record' ){
                var vrRecorder = VRRecording.record({
                        gamepad: true,
                        webvr: true,
                })
        }

        if( params.mode === 'play' ){
        	var experienceUrl = params.experienceUrl ? params.experienceUrl : 'vrExperiences/video2/vr-experience.json'
        	// // var experienceUrl = 'vrExperiences/mvi_0000/vr-experience.json'
 console.log('params', params)
        	// FIXME camera is a GLOBAL! BAD BAD 
		var vrPlayer = VRRecording.play(experienceUrl, function onStarted(){
// debugger;
			console.log('vrExperience started')
			
			// cameraSpectator.position.z = 2
			// cameraSpectator.rotateY(Math.PI)
			
			// if( params.mode === 'play' ){
	                //         // set camera position
	                       var cameraSpectator = camera
	                        if( vrPlayer.vrExperience.fixedCamera !== undefined && cameraSpectator !== undefined ){
	                                cameraSpectator.position.fromArray(vrPlayer.vrExperience.fixedCamera.position)
	                		cameraSpectator.quaternion.fromArray(vrPlayer.vrExperience.fixedCamera.quaternion) 
					cameraSpectator.updateMatrix(true)                               
					cameraSpectator.updateMatrixWorld(true)                               
	                        }
			// }
	                // }else if( mode ===  'edit' ){
	        		// enable the controls during tuning
	        		// var controls	= new THREE.OrbitControls(cameraSpectator)
	        		// controls.enableKeys = false
	        		// controls.zoomSpeed = 0.1
	        		// controls.rotateSpeed = 0.51
	        		// 
	        		// controls.position0.copy(camera.position)
	        		// controls.target0
	        		// 	.set(0,0, -1).applyQuaternion(camera.quaternion.clone().inverse())
	        		// 	.negate().add(controls.position0)
	        		// controls.reset()                        
	                // }else {
	                //         console.assert(false)
	                // }			
		})
		// var vrPlayer = VRRecording.play(experienceUrl, camera, 'play')
        	// vrPlayer.videoElement.parentElement.removeChild(vrPlayer.videoElement)
        }
	
	// init the ui
	this._initUI(params)
}

/**
 * util function to parse the hash
 * @return {[type]} [description]
 */
vrRecordingBookmarklet._parseParamsInHash = function() {
	var variables = {}
	var query = window.location.hash.substring(1);
	if( query.length === 0 )	return variables
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		var varName = decodeURIComponent(pair[0])
		if( pair[1] ){
			var varValue = decodeURIComponent(pair[1]);
		}else{
			var varValue = true
		}
		variables[varName] = varValue
	}
	return variables
}

/**
 * reload page on params changed
 */
vrRecordingBookmarklet._reloadOnParamsChanged = function(params){
	var hashStr = ''
	Object.keys(params).forEach(function(varName){
		var varStr = varName + '=' + params[varName]
		if( hashStr.length > 0 ) hashStr += '&'
		hashStr = hashStr + varStr			
	})
	location.hash = hashStr
	location.reload()
}

/**
 * initialize the ui of the bookmarklet
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
vrRecordingBookmarklet._initUI = function(params) {
	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
        var containerDomElement = document.createElement('div')
	document.body.appendChild(containerDomElement)

        containerDomElement.style.fontFamily = 'monospace'
        containerDomElement.style.color = 'black'
        containerDomElement.style.padding = '0.5em'
        containerDomElement.style.margin = '0.5em'
        containerDomElement.style.position = 'fixed'
        containerDomElement.style.bottom = '0px'
        containerDomElement.style.right = '0px'
        containerDomElement.style.zIndex = 9999
        containerDomElement.style.borderRadius = '1em'
        containerDomElement.style.borderStyle = 'solid'
        containerDomElement.style.backgroundColor = 'lightgrey'

        //////////////////////////////////////////////////////////////////////////////
        //                titleElement
        //////////////////////////////////////////////////////////////////////////////
        var titleElement = document.createElement('h2')
        titleElement.innerHTML = 'VR Recording'
        containerDomElement.appendChild(titleElement)

        ////////////////////////////////////////////////////////////////////////////////
        //          start/pause buttom
        ////////////////////////////////////////////////////////////////////////////////
        
        var recordButton = document.createElement('button')
        recordButton.innerHTML = 'record'
        containerDomElement.appendChild(recordButton)
        recordButton.addEventListener('click', function(){
		params.mode = 'record'
		vrRecordingBookmarklet._reloadOnParamsChanged(params)
        })

        var playButton = document.createElement('button')
        playButton.innerHTML = 'play'
        containerDomElement.appendChild(playButton)
        playButton.addEventListener('click', function(){
		params.mode = 'play'
		vrRecordingBookmarklet._reloadOnParamsChanged(params)
        })

	
        var editButton = document.createElement('button')
        editButton.innerHTML = 'edit'
        containerDomElement.appendChild(editButton)
        editButton.addEventListener('click', function(){
		params.mode = 'edit'
		vrRecordingBookmarklet._reloadOnParamsChanged(params)
        })

        var resetButton = document.createElement('button')
        resetButton.innerHTML = 'reset'
        containerDomElement.appendChild(resetButton)
        resetButton.addEventListener('click', function(){
		params = {}
		vrRecordingBookmarklet._reloadOnParamsChanged(params)
        })

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
        containerDomElement.appendChild(document.createElement('br'))

        var labelElement = document.createElement('label')
        labelElement.innerHTML = 'experience URL : '
        containerDomElement.appendChild(labelElement)
        var experienceUrlInput = document.createElement('input')
        experienceUrlInput.value = params.experienceUrl || ''
        labelElement.appendChild(experienceUrlInput)
        experienceUrlInput.addEventListener('change', function(){
                params.experienceUrl = experienceUrlInput.value
		vrRecordingBookmarklet._reloadOnParamsChanged(params)
        })

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
        containerDomElement.appendChild(document.createElement('br'))

        var labelElement = document.createElement('label')
        labelElement.innerHTML = 'experience URLs : '
        containerDomElement.appendChild(labelElement)
        var selectElement = document.createElement('select')
        selectElement.innerHTML = 'experience URLs : '
        labelElement.appendChild(selectElement)
	var vrExperienceUrls = [
		'vrExperiences/mvi_0000/vr-experience.json',
		'vrExperiences/mvi_1731/vr-experience.json',
		'vrExperiences/mvi_1733/vr-experience.json',
		'vrExperiences/mvi_1740/vr-experience.json',
		'vrExperiences/video1/vr-experience.json',
		'vrExperiences/video2/vr-experience.json',
		'vrExperiences/current/vr-experience.json',
	]
	vrExperienceUrls.forEach(function(vrExperienceUrl){
		var optionElement = document.createElement('option')
		optionElement.value = optionElement.innerHTML = vrExperienceUrl
		selectElement.appendChild(optionElement)		
	})
	selectElement.value = params.experienceUrl
        selectElement.addEventListener('change', function(){
                params.experienceUrl = selectElement.value
                params.mode = 'play'
		vrRecordingBookmarklet._reloadOnParamsChanged(params)
        })


        containerDomElement.appendChild(document.createElement('br'))	
}

//////////////////////////////////////////////////////////////////////////////
//		Code Separator
//////////////////////////////////////////////////////////////////////////////

// FIXME launch it better
// window.addEventListener('load', function(){
	vrRecordingBookmarklet.init()
// })
