var THREEx = THREEx || {}

THREEx.WebvrPlayer = function(){
        THREEx.JsonPlayer.call( this );
        
        this.frameData = null   // TODO put a fake one
        
        this._onNewRecord = function(newRecord){
                this.frameData = newRecord
        }
}
THREEx.WebvrPlayer.prototype = Object.create( THREEx.JsonPlayer.prototype );
THREEx.WebvrPlayer.prototype.constructor = THREEx.WebvrPlayer;
