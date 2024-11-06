let video = document.getElementById("video");
let visualizer;
let lastEmotion = null;
let lastEmotionTimestamp = 0;
const EMOTION_THRESHOLD = 200; // in milliseconds

async function setupVideo() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });
  video.srcObject = stream;
}

async function detectEmotions() {
  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();

  if (detections && detections[0] && detections[0].expressions) {
    const expressions = detections[0].expressions;
    const currentEmotion = Object.entries(expressions)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    const currentTime = Date.now();

    if (currentEmotion !== lastEmotion) {
      // Reset timer for new emotion
      lastEmotion = currentEmotion;
      lastEmotionTimestamp = currentTime;
    } else if (currentTime - lastEmotionTimestamp >= EMOTION_THRESHOLD) {
      // Only update visualization if emotion has been stable for threshold duration
      if (visualizer) {
        visualizer.setEmotion(currentEmotion);

        // Toggle ambient particles visibility based on emotion
        if (visualizer.ambientParticles) {
          visualizer.ambientParticles.visible = (currentEmotion === 'neutral');
        }
      }
    }
  }
}

async function launch() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("dist/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("dist/models");
  await setupVideo();

  visualizer = new EmotionVisualizer();

  // Start with ambient particles hidden
  if (visualizer.ambientParticles) {
    visualizer.ambientParticles.visible = false;
  }

  // Start emotion detection loop
  setInterval(detectEmotions, 100);
}

launch();
