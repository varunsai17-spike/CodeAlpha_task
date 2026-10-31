/* =========================================================================
   1. PLAYLIST DATA (Title, Artist, Duration, Cover, Synthesizer Notes)
   ========================================================================= */
const playlist = [
  {
    id: 0,
    title: "Neon Reverie",
    artist: "Aether Pulse",
    durationSec: 194, // 3:14
    genre: "Cyber Synth",
    bpm: 124,
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
    notes: ["C3", "E3", "G3", "B3", "C4", "G3", "E3", "D3"],
  },
  {
    id: 1,
    title: "Quantum Drift",
    artist: "Nova Horizon",
    durationSec: 228, // 3:48
    genre: "Ambient Lo-Fi",
    bpm: 95,
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500",
    notes: ["D3", "F3", "A3", "C4", "D4", "A3", "F3", "E3"],
  },
  {
    id: 2,
    title: "Silicon Dawn",
    artist: "Vector Echo",
    durationSec: 165, // 2:45
    genre: "Retrowave",
    bpm: 130,
    cover: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500",
    notes: ["A2", "C3", "E3", "G3", "A3", "E3", "C3", "B2"],
  },
  {
    id: 3,
    title: "Deep Space Echoes",
    artist: "Celeste Orbital",
    durationSec: 252, // 4:12
    genre: "Deep Electronic",
    bpm: 110,
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500",
    notes: ["F3", "A3", "C4", "E4", "F4", "C4", "A3", "G3"],
  }
];

/* =========================================================================
   2. AUDIO SYNTHESIS ENGINE (Plays real generative music without external audio files)
   ========================================================================= */
let synth = null;
let sequence = null;
let isAudioEngineReady = false;

function initAudioEngine() {
  if (isAudioEngineReady) return;

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 1.2 }
  }).toDestination();

  const reverb = new Tone.Reverb({ decay: 2.2, wet: 0.35 }).toDestination();
  synth.connect(reverb);
  synth.volume.value = Tone.gainToDb(parseFloat(volumeSlider.value));

  isAudioEngineReady = true;
}

function startMelodyPlayback(notes, bpm) {
  if (!isAudioEngineReady) initAudioEngine();

  Tone.Transport.stop();
  Tone.Transport.cancel();
  Tone.Transport.bpm.value = bpm;

  let noteIdx = 0;
  sequence = new Tone.Loop((time) => {
    const note = notes[noteIdx % notes.length];
    synth.triggerAttackRelease(note, "8n", time);
    noteIdx++;
  }, "8n").start(0);

  Tone.Transport.start();
}

function stopMelodyPlayback() {
  if (isAudioEngineReady) {
    Tone.Transport.stop();
  }
}

/* =========================================================================
   3. DOM ELEMENT REFERENCES
   ========================================================================= */
const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const genreTag = document.getElementById("genreTag");
const bpmTag = document.getElementById("bpmTag");
const albumArt = document.getElementById("albumArt");
const albumDisc = document.getElementById("albumDisc");
const artGlow = document.getElementById("artGlow");

const playPauseBtn = document.getElementById("playPauseBtn");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const loopBtn = document.getElementById("loopBtn");

const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const totalDurationEl = document.getElementById("totalDuration");

const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const muteBtn = document.getElementById("muteBtn");
const volIconHigh = document.getElementById("volIconHigh");
const volIconMuted = document.getElementById("volIconMuted");

const playlistDrawer = document.getElementById("playlistDrawer");
const playlistToggleBtn = document.getElementById("playlistToggleBtn");
const closePlaylistBtn = document.getElementById("closePlaylistBtn");
const playlistContainer = document.getElementById("playlistContainer");

/* Player State */
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isAutoplay = true; // Bonus
let currentSeconds = 0;
let playbackTimer = null;
let previousVolume = 0.75;

/* Format Seconds to MM:SS */
function formatTime(sec) {
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

/* =========================================================================
   4. TRACK LOADER & UI UPDATER
   ========================================================================= */
function loadTrack(index) {
  currentTrackIndex = index;
  const track = playlist[currentTrackIndex];

  songTitle.textContent = track.title;
  artistName.textContent = track.artist;
  genreTag.textContent = track.genre;
  bpmTag.textContent = `${track.bpm} BPM`;
  albumArt.src = track.cover;
  totalDurationEl.textContent = formatTime(track.durationSec);

  currentSeconds = 0;
  progressBar.value = 0;
  currentTimeEl.textContent = "0:00";

  renderPlaylist();
}

/* =========================================================================
   5. PLAYBACK CONTROLS
   ========================================================================= */
async function playTrack() {
  await Tone.start();
  initAudioEngine();

  isPlaying = true;
  playIcon.classList.add("hidden");
  pauseIcon.classList.remove("hidden");
  albumDisc.classList.remove("paused");
  artGlow.style.filter = "blur(30px)";

  const track = playlist[currentTrackIndex];
  startMelodyPlayback(track.notes, track.bpm);

  clearInterval(playbackTimer);
  playbackTimer = setInterval(() => {
    currentSeconds++;
    const total = track.durationSec;
    progressBar.value = (currentSeconds / total) * 100;
    currentTimeEl.textContent = formatTime(currentSeconds);

    if (currentSeconds >= total) {
      handleTrackCompletion();
    }
  }, 1000);
}

function pauseTrack() {
  isPlaying = false;
  playIcon.classList.remove("hidden");
  pauseIcon.classList.add("hidden");
  albumDisc.classList.add("paused");
  artGlow.style.filter = "blur(20px)";

  stopMelodyPlayback();
  clearInterval(playbackTimer);
}

function togglePlay() {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
}

function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex);
  if (isPlaying) playTrack();
}

function nextTrack() {
  if (isShuffle) {
    let rand;
    do {
      rand = Math.floor(Math.random() * playlist.length);
    } while (rand === currentTrackIndex && playlist.length > 1);
    currentTrackIndex = rand;
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  }
  loadTrack(currentTrackIndex);
  if (isPlaying) playTrack();
}

function handleTrackCompletion() {
  if (isAutoplay) {
    nextTrack();
  } else {
    pauseTrack();
    currentSeconds = 0;
    progressBar.value = 0;
    currentTimeEl.textContent = "0:00";
  }
}

/* =========================================================================
   6. SEEK PROGRESS & VOLUME SLIDERS
   ========================================================================= */
progressBar.addEventListener("input", (e) => {
  const track = playlist[currentTrackIndex];
  currentSeconds = (e.target.value / 100) * track.durationSec;
  currentTimeEl.textContent = formatTime(currentSeconds);
});

volumeSlider.addEventListener("input", (e) => {
  const vol = parseFloat(e.target.value);
  volumeValue.textContent = `${Math.round(vol * 100)}%`;

  if (synth) {
    if (vol === 0) {
      synth.volume.value = -Infinity;
    } else {
      synth.volume.value = Tone.gainToDb(vol);
    }
  }

  if (vol === 0) {
    volIconHigh.classList.add("hidden");
    volIconMuted.classList.remove("hidden");
  } else {
    volIconHigh.classList.remove("hidden");
    volIconMuted.classList.add("hidden");
  }
});

muteBtn.addEventListener("click", () => {
  if (volumeSlider.value > 0) {
    previousVolume = volumeSlider.value;
    volumeSlider.value = 0;
  } else {
    volumeSlider.value = previousVolume || 0.75;
  }
  volumeSlider.dispatchEvent(new Event("input"));
});

/* =========================================================================
   7. PLAYLIST DRAWER (BONUS)
   ========================================================================= */
function renderPlaylist() {
  playlistContainer.innerHTML = "";
  playlist.forEach((item, index) => {
    const isCurrent = index === currentTrackIndex;
    const row = document.createElement("div");
    row.className = `playlist-item ${isCurrent ? "active" : ""}`;

    row.innerHTML = `
      <div class="playlist-item-left">
        <span class="playlist-index">${index + 1}</span>
        <div>
          <div class="playlist-title">${item.title}</div>
          <div class="playlist-artist">${item.artist}</div>
        </div>
      </div>
      <div class="playlist-duration">${formatTime(item.durationSec)}</div>
    `;

    row.addEventListener("click", () => {
      loadTrack(index);
      playTrack();
      playlistDrawer.classList.add("hidden-drawer");
    });

    playlistContainer.appendChild(row);
  });
}

playlistToggleBtn.addEventListener("click", () => {
  playlistDrawer.classList.toggle("hidden-drawer");
});

closePlaylistBtn.addEventListener("click", () => {
  playlistDrawer.classList.add("hidden-drawer");
});

/* Shuffle & Loop Toggles */
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle("active-state", isShuffle);
});

loopBtn.addEventListener("click", () => {
  isAutoplay = !isAutoplay;
  loopBtn.classList.toggle("active-state", isAutoplay);
  loopBtn.title = isAutoplay ? "Autoplay Active" : "Autoplay Disabled";
});

/* Event Listeners */
playPauseBtn.addEventListener("click", togglePlay);
prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);

/* Keyboard Hotkeys (Space: Play/Pause, Left/Right: Prev/Next) */
window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.code === "Space") {
    e.preventDefault();
    togglePlay();
  } else if (e.code === "ArrowRight") {
    nextTrack();
  } else if (e.code === "ArrowLeft") {
    prevTrack();
  }
});

/* Initial Setup */
loadTrack(0);