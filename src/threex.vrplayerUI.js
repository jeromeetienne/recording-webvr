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
};
