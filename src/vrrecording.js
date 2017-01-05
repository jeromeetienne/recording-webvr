var VRRecording = {}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

VRRecording.play = function(experienceUrl, camera, mode){
        console.assert( mode === 'edit' ||  mode === 'play' )
	var vrPlayer = new THREEx.VRPlayer()
        
	// create the vrPlayerUI
	var vrPlayerUI = new THREEx.VRPlayerUI(vrPlayer)
	document.body.appendChild(vrPlayerUI.domElement)

        // match experienceUrl
        var matches = experienceUrl.match(/(.*\/)([^\/]+)/)
        var experienceBasename = matches[2]
        var experiencePath = matches[1]

        vrPlayer.load(experiencePath, experienceBasename, function onLoaded(){
                vrPlayer.start()
                
                if( mode === 'play' ){
                        // set camera position
                        if( vrPlayer.vrExperience.camera !== undefined ){
                                camera.position.fromArray(vrPlayer.vrExperience.camera.position)
                		camera.quaternion.fromArray(vrPlayer.vrExperience.camera.quaternion)                                
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
		vrPlayerUI.update()				
	})

        return vrPlayer
}

////////////////////////////////////////////////////////////////////////////////
//          Code Separator
////////////////////////////////////////////////////////////////////////////////

VRRecording.record = function(options){
	var vrRecorder = new THREEx.VRRecorder(options)
        vrRecorder.start()
        window.vrRecorder = vrRecorder 
        return vrRecorder
};
