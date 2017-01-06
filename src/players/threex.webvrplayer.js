var THREEx = THREEx || {}

THREEx.WebvrPlayer = function(){
        THREEx.JsonPlayer.call( this );
        
        this.frameData = null   // TODO put a fake one
        
        this._onNewRecord = function(frameData){
console.log('update frameData', frameData.pose.position)
                this.frameData = frameData
        }
}
THREEx.WebvrPlayer.prototype = Object.create( THREEx.JsonPlayer.prototype );
THREEx.WebvrPlayer.prototype.constructor = THREEx.WebvrPlayer;
