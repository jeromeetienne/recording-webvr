var WebVRPolyfill = function(){}

WebVRPolyfill.prototype.install = function(){

        var framedataProvider = null
        this.setFrameDataProvider = function(newFrameDataProvider){
                framedataProvider = newFrameDataProvider
        }

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
        	if( !framedataProvider )	return
                framedataProvider.updateFrameData(frameData)
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
        	if( !framedataProvider )	return
        	framedataProvider.resetPose()
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
        		loop()
        		
        		return
        		function loop(){
        			if( framedataProvider.started === true ){
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
        
        return this
}

////////////////////////////////////////////////////////////////////////////////
//          FrameDataProviderWebvr
////////////////////////////////////////////////////////////////////////////////


window.FrameDataProviderWebvr  = function(onReady){
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

        setInterval(function(){
                // TODO yuck this use a global
                if( window.vrPlayer === undefined ) return
                if( vrPlayer._webvrPlayer.frameData === null ) return

                var frameData = vrPlayer._webvrPlayer.frameData
                _this.leftProjectionMatrix.fromArray(frameData.leftProjectionMatrix)
                _this.rightProjectionMatrix.fromArray(frameData.rightProjectionMatrix)

                _this.leftViewMatrix.fromArray(frameData.leftViewMatrix)
                _this.rightViewMatrix.fromArray(frameData.rightViewMatrix)
        }, 1000/100)
        
        this.updateFrameData = function(frameData){
        	// copy projectionMatrix + viewMatrix
        	_this.leftProjectionMatrix.toArray(frameData.leftProjectionMatrix)
        	_this.rightProjectionMatrix.toArray(frameData.rightProjectionMatrix)
        	_this.leftViewMatrix.toArray(frameData.leftViewMatrix)
        	_this.leftViewMatrix.toArray(frameData.rightViewMatrix)
        	
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
        
	// notify caller if needed
	onReady && onReady()
}
