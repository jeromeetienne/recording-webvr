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
