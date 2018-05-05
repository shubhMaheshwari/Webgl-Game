




// global constants
var FFTSIZE = 32;      // number of samples for the analyser node FFT, min 32
var TICK_FREQ = 20;     // how often to run the tick function, in milliseconds
var CIRCLES = 8;        // the number of circles to draw.  This is also the amount to break the files into, so FFTSIZE/2 needs to divide by this evenly
var RADIUS_FACTOR = 40; // the radius of the circles, factored for which ring we are drawing
var MIN_RADIUS = 1;     // the minimum radius of each circle

// global variables
var playlist = ['./assets/ReadyOrNot.mp3','./assets/StressedOut.mp3','./assets/These_days.mp3','./assets/More_Than_You_Know.mp3','./assets/middle.mp3'];
var src = playlist[randint(playlist.length)];

var soundInstance;      // the sound instance we create
var analyserNode;       // the analyser node that allows us to visualize the audio
var freqFloatData, freqByteData, timeByteData;  // arrays to retrieve data from analyserNode
var circles = {};       // object has of circles shapes
var circleHue = 300;   // the base color hue used when drawing circles, which can change
var circleFreqChunk;    // The chunk of freqByteData array that is computed per circle
var dataAverage = [42, 42, 42, 42];   // an array recording data for the last 4 ticks


var dataDiff;

function init() {
  // Web Audio only demo, so we register just the WebAudioPlugin and if that fails, display fail message
  if (!createjs.Sound.registerPlugins([createjs.WebAudioPlugin])) {
    document.getElementById("error").style.display = "block";
    return;
  }

  createjs.Sound.on("fileload", handleLoad, this); // add an event listener for when load is completed
  createjs.Sound.registerSound(src);  // register sound, which will preload automatically
  
}

function handleLoad(evt) {
  // get the context. NOTE to connect to existing nodes we need to work in the same context.
  var context = createjs.Sound.activePlugin.context;

  // create an analyser node
  analyserNode = context.createAnalyser();
  analyserNode.fftSize = FFTSIZE;  //The size of the FFT used for frequency-domain analysis. This must be a power of two
  analyserNode.smoothingTimeConstant = 0.85;  //A value from 0 -> 1 where 0 represents no time averaging with the last analysis frame
  analyserNode.connect(context.destination);  // connect to the context.destination, which outputs the audio

  // attach visualizer node to our existing dynamicsCompressorNode, which was connected to context.destination
  var dynamicsNode = createjs.Sound.activePlugin.dynamicsCompressorNode;
  dynamicsNode.disconnect();  // disconnect from destination
  dynamicsNode.connect(analyserNode);

  // set up the arrays that we use to retrieve the analyserNode data
  freqFloatData = new Float32Array(analyserNode.frequencyBinCount);
  freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
  timeByteData = new Uint8Array(analyserNode.frequencyBinCount);

  // calculate the number of array elements that represent each circle
  circleFreqChunk = analyserNode.frequencyBinCount / CIRCLES;

  // enable touch interactions if supported on the current device, and display appropriate message
    startPlayback();
}

// this will start our playback in response to a user click, allowing this demo to work on mobile devices
function startPlayback(evt) {

  if (soundInstance) {
    return;
  } // if this is defined, we've already started playing.  This is very unlikely to happen.

  soundInstance = createjs.Sound.play(src, {loop: -1});

  // start the tick and point it at the window so we can do some work before updating the stage:
  createjs.Ticker.addEventListener("tick", tick);
  createjs.Ticker.setInterval(TICK_FREQ);
}

function tick(evt) {
  analyserNode.getFloatFrequencyData(freqFloatData);  // this gives us the dBs
  analyserNode.getByteFrequencyData(freqByteData);  // this gives us the frequency
  analyserNode.getByteTimeDomainData(timeByteData);  // this gives us the waveform

  var lastRadius = 0;  // we use this to store the radius of the last circle, making them relative to each other
  // run through our array from last to first, 0 will evaluate to false (quicker)
  for (var i = 0; i < CIRCLES; i++) {
    var freqSum = 0;
    var timeSum = 0;
    for (var x = circleFreqChunk; x; x--) {
      var index = (CIRCLES - i) * circleFreqChunk - x;
      freqSum += freqByteData[index];
      timeSum += timeByteData[index];
    }
    freqSum = freqSum / circleFreqChunk / 256;  // gives us a percentage out of the total possible value
    timeSum = timeSum / circleFreqChunk / 256;  // gives us a percentage out of the total possible value
    // NOTE in testing it was determined that i 1 thru 4 stay 0's most of the time

    // draw circle
    lastRadius += freqSum * RADIUS_FACTOR + MIN_RADIUS;
  }

  // update our dataAverage, by removing the first element and pushing in the new last element
  dataAverage.shift();
  dataAverage.push(lastRadius);

  // get our average data for the last 3 ticks
  var dataSum = 0;
  for (var i = dataAverage.length - 1; i; i--) {
    dataSum += dataAverage[i - 1];
  }
  dataSum = dataSum / (dataAverage.length - 1);

  // calculate latest change
   dataDiff = dataAverage[dataAverage.length - 1] - dataSum;
  // change color based on large enough changes
}

init()