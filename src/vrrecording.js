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
