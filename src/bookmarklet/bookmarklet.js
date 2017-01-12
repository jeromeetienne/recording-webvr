window.vrRecordingBookmarklet = function(){}	

vrRecordingBookmarklet._record = function(){	
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
}

vrRecordingBookmarklet._play = function(experienceUrl, onStarted){
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

vrRecordingBookmarklet.init = function(){	
        var params = vrRecordingBookmarklet._parseParamsInHash()

	//////////////////////////////////////////////////////////////////////////////
	//		Code Separator
	//////////////////////////////////////////////////////////////////////////////
        if( params.mode === 'record' ){
                vrRecordingBookmarklet._record()
        }

        if( params.mode === 'play' ){
        	var experienceUrl = params.experienceUrl ? params.experienceUrl : 'vrExperiences/video2/vr-experience.json'
        	// // var experienceUrl = 'vrExperiences/mvi_0000/vr-experience.json'
 console.log('params', params)
        	// FIXME camera is a GLOBAL! BAD BAD 
		var vrPlayer = vrRecordingBookmarklet._play(experienceUrl, function onStarted(){
// debugger;
			console.log('vrExperience started')
			
			// cameraSpectator.position.z = 2
			// cameraSpectator.rotateY(Math.PI)
			
			// if( params.mode === 'play' ){
	                //         // set camera position
	                //        var cameraSpectator = camera
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
