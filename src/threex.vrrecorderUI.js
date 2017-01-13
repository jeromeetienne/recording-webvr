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
};

