function WebVRPolyfill(){
}

WebVRPolyfill.overloadWebvrAPI = function(){

        navigator.getVRDisplays = function(){
        	console.log('navigator.getVRDisplays()')
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
        	this.displayName = 'Webgl Polyfill Helmet'

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
        	if( !positionalTracking )	return

        	// copy projectionMatrix + viewMatrix
        	positionalTracking.leftProjectionMatrix.toArray(frameData.leftProjectionMatrix)
        	positionalTracking.rightProjectionMatrix.toArray(frameData.rightProjectionMatrix)
        	positionalTracking.leftViewMatrix.toArray(frameData.leftViewMatrix)
        	positionalTracking.leftViewMatrix.toArray(frameData.rightViewMatrix)
        	
        	////////////////////////////////////////////////////////////////////////////////
        	//          update pose.position/pose.quaternion
        	////////////////////////////////////////////////////////////////////////////////
        	
                frameData.timestamp = Date.now()

        	// compute cameraTransformMatrix from leftViewMatrix (we picked the first. we could use rightViewMatrix too)
        	var leftViewMatrix = new THREE.Matrix4().fromArray(frameData.leftViewMatrix)
        	var cameraTransformMatrix = new THREE.Matrix4().getInverse( leftViewMatrix )

        	// set pose.position and pose.orientation from cameraTransformMatrix decomposition
        	var cameraPosition = new THREE.Vector3()
        	var cameraQuaternion = new THREE.Quaternion()
        	cameraTransformMatrix.decompose(cameraPosition, cameraQuaternion, new THREE.Vector3)
        	cameraPosition.toArray(frameData.pose.position)
        	cameraQuaternion.toArray(frameData.pose.orientation)	
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
        	if( !positionalTracking )	return
        	positionalTracking.resetPose()
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
        		if( window.positionalTracking === null ){
        			window.positionalTracking = createPositionalTracking()
        		}
        		
        		loop()
        		
        		return
        		function loop(){
        			if( window.positionalTracking.started === true ){
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
}

////////////////////////////////////////////////////////////////////////////////
//          PositionTrackingWebvr
////////////////////////////////////////////////////////////////////////////////


window.PositionTrackingWebvr  = function(onReady){
	var _this = this
	_this.started = true;

	_this.leftProjectionMatrix = new THREE.Matrix4()
	_this.rightProjectionMatrix = new THREE.Matrix4()
	_this.leftViewMatrix = new THREE.Matrix4()
	_this.rightViewMatrix = new THREE.Matrix4()
	
	// fill silly projectionMaterix
	var tmpCamera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight /2, 0.1, 10000 );
	this.leftProjectionMatrix.copy( tmpCamera.projectionMatrix )
	this.rightProjectionMatrix.copy( tmpCamera.projectionMatrix )

	this.resetPose = function(){}
	this.dispose = function(){}
	
        this._updateWithFrameData = function(frameData){
                _this.leftProjectionMatrix.fromArray(frameData.leftProjectionMatrix)
                _this.rightProjectionMatrix.fromArray(frameData.rightProjectionMatrix)

                _this.leftViewMatrix.fromArray(frameData.leftViewMatrix)
                _this.rightViewMatrix.fromArray(frameData.rightViewMatrix)
        }
        setInterval(function(){
                if( window.vrPlayer === undefined ) return
                if( vrPlayer._webvrPlayer.frameData === null ) return
                _this._updateWithFrameData(vrPlayer._webvrPlayer.frameData)
        }, 1000/100)
        
	// notify caller if needed
	onReady && onReady()
}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

// to init positionalTracking at requestPresent
window.positionalTracking = null	

// to init positionalTracking immediatly
// window.positionalTracking = createPositionalTracking()

function createPositionalTracking(){

        var positionalTracking = new PositionTrackingWebvr(function onReady(){
                console.log('PositionTrackingWebvr is ready')
        })
        return positionalTracking
}
var THREEx = THREEx || {}

THREEx.JsonPlayer = function(){
        var _this = this

        _this.records = null
	_this._onNewRecord = function(newRecord){}      // overload this function
        _this.playbackRate = 1

        ////////////////////////////////////////////////////////////////////////////////
        //          load files
        ////////////////////////////////////////////////////////////////////////////////
        this.currentTime = 0
        this.started = false
        this.paused = false
        this.start = function(){
console.log('start player', this)
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
                                _this._onNewRecord(values[i].data)                
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

THREEx.JsonRecorder = function(){
        var _this = this

	_this._fetchNewRecordData = function(){ return 'newRecord'}      // overload this function
        
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
                var recordData = _this._fetchNewRecordData()
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
                download(jsonString, basename, 'application/json');

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
var THREEx = THREEx || {}

THREEx.WebvrPlayer = function(){
        THREEx.JsonPlayer.call( this );
        
        this.frameData = null   // TODO put a fake one
        
        this._onNewRecord = function(frameData){
// console.log('update frameData', frameData.pose.position)
                this.frameData = frameData
        }
}
THREEx.WebvrPlayer.prototype = Object.create( THREEx.JsonPlayer.prototype );
THREEx.WebvrPlayer.prototype.constructor = THREEx.WebvrPlayer;
var THREEx = THREEx || {}

THREEx.GamepadPlayer = function(){
        THREEx.JsonPlayer.call( this );
        
        this.gamepads = [
                null,
                null,
                null,
                null,
        ]
        
        this._onNewRecord = function(newRecord){
                this.gamepads = newRecord
        }
}
THREEx.GamepadPlayer.prototype = Object.create( THREEx.JsonPlayer.prototype );
THREEx.GamepadPlayer.prototype.constructor = THREEx.GamepadPlayer;
var THREEx = THREEx || {}

THREEx.WebvrRecorder = function(){
        THREEx.JsonRecorder.call( this );

        this.autoSaveBaseName = 'webvrrecords'
                
	var frameData = new VRFrameData()
        this._fetchNewRecordData = function(newRecord){
                this._vrDisplay.getFrameData(frameData);
// console.log('store webvr framedata', frameData.pose.position)
                var frameDataJSON = JSON.parse(JSON.stringify(frameData))
                return frameDataJSON
        }
        
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
        THREEx.JsonRecorder.call( this );
        
        this.autoSaveBaseName = 'gamepadrecords'
        
        this._fetchNewRecordData = function(newRecord){
                var gamepads = navigator.getGamepads();
                // clone the struct
                // cloneObject Needed because in chrome, gamepad struct doesnt support JSON.parse(JSON.stringify(data))
                gamepads = THREEx.GamepadRecorder._cloneObject(gamepads)
                return gamepads
        }
        
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
var THREEx = THREEx || {}

THREEx.VRPlayerUI = function(vrPlayer){
        this.vrPlayer = vrPlayer
        this.domElement = document.createElement('div')
        
        this.domElement.style.margin = '0.5em'
        this.domElement.style.position = 'absolute'
        this.domElement.style.top = '0px'
        this.domElement.style.left = '0px'
        
        ////////////////////////////////////////////////////////////////////////////////
        //          Code Separator
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
                
                videoDurationValue.innerHTML = vrPlayer.videoElement.duration.toFixed(2) + 'sec'
        }
}

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

/**
 * start recording
 */
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

var VRRecording = {}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

VRRecording.play = function(experienceUrl, camera, mode){
        console.assert( mode === 'edit' ||  mode === 'play' )
        
        // create vrPlayer
	var vrPlayer = new THREEx.VRPlayer()
        document.body.appendChild(vrPlayer.videoElement)

        // export it globally - easier for debug
        window.vrPlayer = vrPlayer

	// // create the vrPlayerUI
	// var vrPlayerUI = new THREEx.VRPlayerUI(vrPlayer)
	// document.body.appendChild(vrPlayerUI.domElement)

        // match experienceUrl
        var matches = experienceUrl.match(/(.*\/)([^\/]+)/)
        var experienceBasename = matches[2]
        var experiencePath = matches[1]

        vrPlayer.load(experiencePath, experienceBasename, function onLoaded(){
                vrPlayer.start()
                if( mode === 'play' ){
                        // set camera position
                        if( vrPlayer.vrExperience.fixedCamera !== undefined && camera !== undefined ){
                                camera.position.fromArray(vrPlayer.vrExperience.fixedCamera.position)
                		camera.quaternion.fromArray(vrPlayer.vrExperience.fixedCamera.quaternion)                                
                        }
                }else if( mode === 'edit' ){
        		// enable the controls during tuning
        		controls	= new THREE.OrbitControls(camera, renderer.domElement)
        		controls.enableKeys = false
        		controls.zoomSpeed = 0.1
        		controls.rotateSpeed = 0.5
        		
        		// controls.position0.copy(camera.position)
        		// controls.target0
        		// 	.set(0,0, -1).applyQuaternion(camera.quaternion.clone().inverse())
        		// 	.negate().add(controls.position0)
        		// controls.reset()                        
                }else {
                        console.assert(false)
                }
        })

        
	// TODO put that in vrPlayer itself
	var clock = new THREE.Clock()
	requestAnimationFrame(function render() {
		var delta = clock.getDelta()
		requestAnimationFrame( render );
		
		if( vrPlayer.isStarted() ){
			vrPlayer.update(delta)				
		}
		// vrPlayerUI.update()				
	})

        return vrPlayer
}




////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

VRRecording.record = function(options){
	var vrRecorder = new THREEx.VRRecorder(options)
        vrRecorder.start()
        // export it globally - easier for debug
        window.vrRecorder = vrRecorder
        

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
}));