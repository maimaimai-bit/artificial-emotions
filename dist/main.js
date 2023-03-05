let happy = document.getElementById("happy")
let sad = document.getElementById("sad")
let angry = document.getElementById("angry")
let surprised = document.getElementById("surprised")
let disgusted = document.getElementById("disgusted")
let ending = document.getElementById("ending")

let state = document.getElementById("state");

function poemByExpression(expression) {
  state.innerHTML = expression;
  switch (expression.toLowerCase()) { 
    case "happy": 
      happy.style.display = "block"
      break
    case "angry": 
      angry.style.display = "block"
      break
    case "sad": 
      sad.style.display = "block"
      break
    case "surprised": 
      surprised.style.display = "block"
      break
    case "disgusted": 
      disgusted.style.display = "block"
  }
}

let instruction = document.getElementById("instruction")

function lastInstruction() {
  if (happy.style.display == "none") {
    instruction.innerHTML = "almost there! if you're ____ and you know it clap your hands?"
  }
  else if (angry.style.display == "none") {
    instruction.innerHTML = "almost there! what emotion is associated with the color red?"
  }
  else if (sad.style.display == "none") {
    instruction.innerHTML = "almost there! the majority of songs are of this emotion..."
  }
  else if (surprised.style.display == "none") {
    instruction.innerHTML = "almost there! expect the unexpected..."
  }
  else {
    instruction.innerHTML = "almost there! yuck, cringe, the ick...???"
  }
}

let main = document.getElementById("main")
let mainOverlay = document.getElementById("main-overlay")
let question = document.getElementById("question")
let close = document.getElementById("close")

function end() {
  instruction.innerHTML = "well done! now you know all 'bout the Artificial Emotions (AE)."
  setTimeout(() => { ending.style.display = "block" }, 5000) 
  setTimeout(() => { question.style.display = "block" }, 5000) 
  question.addEventListener("click", () => {
    main.style.display = "none"
    mainOverlay.style.display = "grid"
  })
  close.addEventListener("click", () => {
    main.style.display = "block"
    mainOverlay.style.display = "none"
  })
}

/**
 * Get the most likely current expression using the facepi detection object.
 * Build a array to iterate on each possibility and pick the most likely.
 * @param {Object} expressions object of expressions
 * @return {String}
 */
function getCurrentExpression(expressions) {
  let maxValue = Math.max(
    ...Object.values(expressions).filter(value => value <= 1)
  );
  let expressionsKeys = Object.keys(expressions);
  let mostLikely = expressionsKeys.filter(
    expression => expressions[expression] === maxValue
  );
  return mostLikely[0] ? mostLikely[0] : "neutral";
}

/**
 * Set an refresh interval where the faceapi will scan the face of the subject
 * and return an object of the most likely expressions.
 * Use this detection data to display the poem paragraphs.
 */
async function refreshState() {
  setInterval(async () => {
    let detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections && detections[0] && detections[0].expressions) {
      poemByExpression(getCurrentExpression(detections[0].expressions))
    }

    let emotions = document.getElementsByClassName("emotion")
    let count = 0

    for (let i = 0; i < 5; i++) {
      if (emotions.item(i).style.display == "block") {
        count++
      }
    }
    if (count == 1) {
      instruction.innerHTML = "got another one?"
    }
    else if (count == 2) {
      instruction.innerHTML = "good job! keep going!"
    }
    else if (count == 3) {
      instruction.innerHTML = "feelings feelings... gotta catch them all..."
    }
    else if (count == 4) {
      lastInstruction()
    }
    else if (count == 5) {
      end()
    }
  }, 800); 
}

let video = document.getElementById("video")
video.addEventListener("play", refreshState)

function setupVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(stream => { 
      video.srcObject = stream;
    })
    .catch(err => console.error("camera not found", err))
}

async function launch() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("dist/models")
  await faceapi.nets.faceExpressionNet.loadFromUri("dist/models")
  setupVideo();
}

launch();
