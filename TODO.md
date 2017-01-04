- issue when starting vrPlayer.start()
  - videoToGamepadDelay can be negative or not
- vrExperience.json : put all gamepad info in a single object
- see how to able Orbits controls as a given position
- make boilerplate smaller
- include it in lightsaberinvr

----------------
- what is needed to tune an experience ?
  - play experience start.stop
  - pause it button
  - seek with various values
  - change videoToGamepadDelay - with a input value
  - display camera position/quaternion on screen for cut/paste

- make webvrrecorder.html and gamepadrecorder.html more homogeneous
- package it all in a single .js in build
- make a aframe components for it ?

- rename all demo repository by demo.* and recording-webvr stay as is
  - there is nothing threex into it

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
