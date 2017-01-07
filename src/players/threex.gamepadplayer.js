var THREEx = THREEx || {}

THREEx.GamepadPlayer = function(){
        var _this = this
        THREEx.JsonPlayer.call( this, function onNewRecord(newRecord){
                _this.gamepads = newRecord                
        });
        
        this.gamepads = [
                null,
                null,
                null,
                null,
        ]
}
THREEx.GamepadPlayer.prototype = Object.create( THREEx.JsonPlayer.prototype );
THREEx.GamepadPlayer.prototype.constructor = THREEx.GamepadPlayer;
