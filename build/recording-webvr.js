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

THREEx.GamepadRecorder = function(){
        THREEx.JsonRecorder.call( this );
        
        this.autoSaveBaseName = 'gamepadrecords'
                
        this._fetchNewRecordData = function(newRecord){
                var gamepads = navigator.getGamepads();
                // clone the struct
                // gamepads = JSON.parse(JSON.stringify(gamepads))
                gamepads = THREEx.GamepadRecorder.cloneObject(gamepads)
                return gamepads
        }
        
        return

}
THREEx.GamepadRecorder.prototype = Object.create( THREEx.JsonRecorder.prototype );
THREEx.GamepadRecorder.prototype.constructor = THREEx.GamepadRecorder;

// from http://stackoverflow.com/a/4460624
// Needed because gamepad struct doesnt support JSON.parse(JSON.stringify(data))
THREEx.GamepadRecorder.cloneObject = function(item) {
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
                result[index] = cloneObject( child );
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
                        result[i] = cloneObject( item[i] );
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

THREEx.JsonPlayer = function(){
        var _this = this

        _this.records = null
	_this._onNewRecord = function(newRecord){}      // overload this function
        _this.playbackRate = 1

        ////////////////////////////////////////////////////////////////////////////////
        //          load files
        ////////////////////////////////////////////////////////////////////////////////
        this.currentTime = null
        this.paused = false
        this.start = function(){
                console.assert( this.isStarted() === false )
                _this.currentTime = 0
                _this.paused = false

                onCurrentTimeChange()
        }
        this.stop = function(){
                _this.currentTime = null
                _this.paused = false
        }
        this.isStarted = function(){
                return _this.currentTime !== null ? true : false
        }
        this.pause = function(onOff){
                console.assert( this.isStarted() )
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
        var autoSaveCounter = 0


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
                
                console.assert(timerId === null)
                timerId = setInterval(update, _this.updatePeriod)
                return this
        }
        this.stop = function(){
                if( _this.autoSave === true )   autoSave()

                autoSaveCounter = 0
                
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
                var basename = _this.autoSaveBaseName+pad(autoSaveCounter, 4)+'.json'
                var jsonString = JSON.stringify(records, null, "\t"); 
                // var jsonString = JSON.stringify(records); 
                download(jsonString, basename, 'application/json');

                // update autoSaveCounter
                autoSaveCounter++;                
                
                // clear records
                records.startedAt = Date.now()
                records.values = []                
        }
        function pad(num, size) {
                var s = num + '';
                while (s.length < size) s = '0' + s;
                return s;
        }
}
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

THREEx.WebvrPlayer = function(){
        THREEx.JsonPlayer.call( this );
        
        this.frameData = null   // TODO put a fake one
        
        this._onNewRecord = function(newRecord){
                this.frameData = newRecord
        }
}
THREEx.WebvrPlayer.prototype = Object.create( THREEx.JsonPlayer.prototype );
THREEx.WebvrPlayer.prototype.constructor = THREEx.WebvrPlayer;
var THREEx = THREEx || {}

THREEx.WebvrRecorder = function(){
        THREEx.JsonRecorder.call( this );

        this.autoSaveBaseName = 'webvrrecords'
                
	var frameData = new VRFrameData()
        this._fetchNewRecordData = function(newRecord){
                this._vrDisplay.getFrameData(frameData);
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
