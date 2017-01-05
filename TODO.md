- issue when starting vrPlayer.start()
  - videoToGamepadDelay can be negative or not
- see how to able Orbits controls as a given position
- put 'vrPlayer.update(delta)' in vrPlayer itself
- include it in lightsaberinvr

----------------
- what is needed to tune an experience ?
  - play experience start.stop
  - pause it button
  - seek with various values
  - change videoToGamepadDelay - with a input value
  - display camera position/quaternion on screen for cut/paste
- vrExperience.json : put all gamepad info in a single object
- make webvrrecorder.html and gamepadrecorder.html more homogeneous
- make a aframe components for it ?

- rename all demo repository by demo.* and recording-webvr stay as is
  - there is nothing threex into it, which name to use ?
  - MixedRealityVideo.js ? javascript tools to record your VR experiences

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
    - various position
    - gamepadrecord files, video files, 
  - DONE move cloneObject into gamepad only
