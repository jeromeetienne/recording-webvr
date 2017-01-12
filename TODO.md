- autogenerate the experience name
  - experience name => directory in examples/vrExperiences
  - vrExperience-date/ the date of where we started the record
  - generate this in THREEx.VRRecorder
- clean up bookmarklet code
- vrRecording is useless, put it all bookmarklet  


- switch to server version

- issue when starting vrPlayer.start()
  - videoToGamepadDelay can be negative or not
  - same for webvrDelay i imagine

- make examples as tools.
  - examples/vrrecording_*.html, do the hash for play/record
  - like if i want to record webvr/gamepad i can go on the site, without installing anything
  - thus no need for dev computer
  - so parse hash url as a querystring

- what about controls camera?
  - see how to able Orbits controls as a given position - important while tuning
  - you need vrcontrols during replay
  - very three.js specific... avoid that
- webvr-polyfill.backup webvr actual functions ?
  - why would do that ?


- test if the file download in qt - same issue as download
- use filesystem .js to store the experience without downloading from browser ?
  - test qt file download
  - avoid the 'copy data file from htc vive desktop to jerome laptop with a usb key'
  - https://github.com/jvilk/BrowserFS/wiki/Using-BrowserFS 
  - how to set it up ? i dont seems to find how to setup the server...
  - better as it doesnt presuppose the browser got a accessible file system
    - e.g. if you run it in pixel... how the download will work ?
    - relying on xmlhttpserver MUST at least be an option
    - own can do download and xmlhttprequest as a option to pick

----------------

- what is needed to tune an experience ?
  - play experience start.stop
  - pause it button
  - seek with various values
  - change videoToGamepadDelay - with a input value
  - display camera position/quaternion on screen for cut/paste
- vrExperience.json : put all gamepad info in a single object, and all the webvr one too
- make webvrrecorder.html and gamepadrecorder.html more homogeneous
- make a aframe components for it ?

- rename all demo repository by demo.* and recording-webvr stay as is
  - there is nothing threex into it, which name to use ?
  - MixedRealityVideo.js ? javascript tools to record your VR experiences

- DONE make it such it is possible with monkey url, inline javascript
  - with the vrrecording_json.html script - thus it is possible to use it on any page
  - a chrome extension ? no
- DONE in src/recorders/ change the callback system, copy the one from players
- DONE webvr-polyfill add present as timestamp... even if there is nothing to replay
- DONE make the library independant of three.js
  - pushed all computation outofthelibrary
- DONE webvr-polyfill.install(framedataProvider);
  - leftProjectionMatrix/rightProjectionMatrix
  - leftViewMatrix/rightViewMatrix
- DONE raw display of webvr.frameData and navigator.getGamepads
- DONE rename vrExperience.camera into vrExperience.fixedCamera it may be absent
- DONE dump a vrExperience.json on vrRecorder.stop()
- DONE package it all in a single .js in build
- file are getting huge... how to do better ?
  - store only delta
  - store in binary
- LATER save in binary - should i record in json ?
  - large files => slow download + huge memory usage
  - what are the alternatives ? to save in binary
  - what about after you did json ?
  - yeah no emergency

- DONE put a json format to store the whole experience
- DONE move cloneObject into gamepad only
