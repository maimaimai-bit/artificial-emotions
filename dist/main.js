let video = document.getElementById("video");
let visualizer;
let lastEmotion = null;
let lastEmotionTimestamp = 0;
let lastPlayedEmotion = null;
const EMOTION_THRESHOLD = 200;

// Audio setup
let currentAudio = null;
let currentFadeInterval = null;
const audioElements = {
    happy: new Audio('./dist/music/happy.mp3'),
    sad: new Audio('./dist/music/sad.mp3'),
    angry: new Audio('./dist/music/angry.mp3'),
    surprised: new Audio('./dist/music/surprised.mp3')
};

// Configure all audio elements
Object.values(audioElements).forEach(audio => {
    audio.loop = true;
    audio.volume = 0;
});

function getRandomTimestamp(duration) {
    const maxTime = Math.max(0, duration - 30);
    return Math.random() * maxTime;
}

function crossfadeAudio(newEmotion) {
    // Skip audio changes for neutral state
    if (newEmotion === 'neutral') {
        if (currentAudio) {
            currentAudio.volume = 0;
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
        lastPlayedEmotion = 'neutral';
        return;
    }

    // Don't change audio if emotion hasn't changed
    if (newEmotion === lastPlayedEmotion) return;

    const newAudio = audioElements[newEmotion];
    if (!newAudio) return;

    // Set random timestamp and start playing
    if (newAudio.duration) {
        newAudio.currentTime = getRandomTimestamp(newAudio.duration);
    }
    newAudio.volume = 1;
    newAudio.play().catch(e => console.log('Audio play failed:', e));

    // Stop previous audio
    if (currentAudio && currentAudio !== newAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = newAudio;
    lastPlayedEmotion = newEmotion;
}

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
            lastEmotion = currentEmotion;
            lastEmotionTimestamp = currentTime;
        } else if (currentTime - lastEmotionTimestamp >= EMOTION_THRESHOLD) {
            if (visualizer) {
                visualizer.setEmotion(currentEmotion);
                
                // Handle audio transition
                if (currentEmotion === 'disgusted') {
                    crossfadeAudio('angry');
                } else {
                    crossfadeAudio(currentEmotion);
                }

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

    if (visualizer.ambientParticles) {
        visualizer.ambientParticles.visible = false;
    }

    setInterval(detectEmotions, 100);
}

launch();
