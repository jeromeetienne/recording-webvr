# Recording WebVR Experiences

Tools i use to record webvr experiences. The goal is to be able to create 
nice looking [mixed reality](https://en.wikipedia.org/wiki/Mixed_reality) videos.
Here is a [first video](https://twitter.com/LearningThreejs/status/814910888285274112).

It is very much a work in progress, maybe it can help others :)

[Github Repository](http://github.com/jeromeetienne/recording-webvr/) - 
[Open Issues](http://github.com/jeromeetienne/recording-webvr/issues/) -
[New Issue](http://github.com/jeromeetienne/recording-webvr/issues/new)


# Getting Started

Just add this line in your page and the recording webvr UI will appears.

```html
<script src='recording-webvr-bookmarklet.js'></script>
```

to record with simple-upload.js, start the server. It will save the experience in ```examples/current```

```bash
npm run start
```

# Examples
- [examples/ccapture.html](https://jeromeetienne.github.io/recording-webvr/examples/ccapture.html) - record a webm movie from a 3d scene with ccapture library
- [examples/vrrecording_json.html](https://jeromeetienne.github.io/recording-webvr/examples/vrrecording_json.html) - record/replay vr experiences. aka webvr/gamepad/video
- [examples/vrrecording_threejs.html](https://jeromeetienne.github.io/recording-webvr/examples/vrrecording_threejs.html) - record/replay vr experiences in three.js
