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

