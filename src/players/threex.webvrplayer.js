var THREEx = THREEx || {}

THREEx.WebvrPlayer = function(){
        var _this = this
        THREEx.JsonPlayer.call( this , function onNewRecord(frameData){
                _this.frameData = frameData
        });
        
        this.frameData = null   // TODO put a fake one
}
THREEx.WebvrPlayer.prototype = Object.create( THREEx.JsonPlayer.prototype );
THREEx.WebvrPlayer.prototype.constructor = THREEx.WebvrPlayer;
