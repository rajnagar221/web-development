console.log("Lets write JavaScript");

let currentSong = new Audio();
let songs;
let currFolder;

// time format
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// get songs
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  songs = [];

  for (let element of as) {
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" width="34" src="img/music.svg">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Harry</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="img/play.svg">
        </div>
      </li>`;
  }

  // click event
  Array.from(document.querySelectorAll(".songList li")).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info div").innerText.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {

  currentSong.src = `/${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);

  currentSong.addEventListener("loadedmetadata", () => {
    document.querySelector(".songtime").innerHTML =
      `00:00 / ${secondsToMinutesSeconds(currentSong.duration)}`;
  });
};

// display albums
async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  for (let e of anchors) {
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {

      let folder = e.href.split("/").slice(-2)[0];

      let res = await fetch(`/songs/${folder}/info.json`);
      let data = await res.json();

      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">▶</div>
          <img src="/songs/${folder}/cover.jpg">
          <h2>${data.title}</h2>
          <p>${data.description}</p>
        </div>`;
    }
  }

  // card click
  Array.from(document.querySelectorAll(".card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

// MAIN FUNCTION
async function main() {

  let play = document.getElementById("play");
  let previous = document.getElementById("previous");
  let next = document.getElementById("next");

  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });


currentSong.addEventListener("timeupdate", () => {

  if (!isNaN(currentSong.duration)) {

    document.querySelector(".songtime").innerHTML =
      `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  }

});

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.clientWidth) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });


  const hamburger = document.querySelector(".hamburger");
  const closeBtn = document.querySelector(".close");
  const sidebar = document.querySelector(".left");

  if (hamburger && closeBtn && sidebar) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.add("active");
    });

    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("active");
    });
  }


  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index > 0) playMusic(songs[index - 1]);
  });



  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    if (index < songs.length - 1) playMusic(songs[index + 1]);
  });

  
  document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
  });
}

main();