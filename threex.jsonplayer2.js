var THREEx = THREEx || {}

THREEx.JsonPlayer = function(){
        var _this = this

        _this.records = null
	_this._onNewRecord = function(newRecord){}      // overload this function
        _this.playbackRate = 1

        ////////////////////////////////////////////////////////////////////////////////
        //          load files
        ////////////////////////////////////////////////////////////////////////////////
        var currentTime = null
        var isPaused = false
        this.start = function(){
                console.assert( this.isStarted() === false )
                currentTime = 0
                isPaused = false

                onCurrentTimeChange()
        }
        this.stop = function(){
                currentTime = null
                isPaused = false
        }
        this.isStarted = function(){
                return currentTime !== null ? true : false
        }
        this.pause = function(onOff){
                console.assert( this.isStarted() )
                isPaused = onOff
        }
        this.update = function(deltaTime){
                if( this.isStarted() === false )      return

                if( isPaused === true ) return

                // get ho
                currentTime += deltaTime * 1000
                
                onCurrentTimeChange()
        }
        return
        
        function onCurrentTimeChange(){
                var timestamp = _this.records.startedAt + currentTime * _this.playbackRate
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

