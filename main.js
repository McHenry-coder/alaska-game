const state = {
  selectedCharacter: null,
  currentLocation: null,
  slides: {
    anchorage: [
      "img/anchorage1.jpg",
      "img/anchorage2.jpg"
    ],
    homer: [
      "img/homer1.jpg",
      "img/homer2.jpg"
    ],
    seward: [
      "img/seward1.jpg"
    ],
    whittier: [
      "img/whittier1.jpg"
    ]
  },
  slideIndex: 0
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(el => {
    el.classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");

  // Control title music: play when showing title screen, pause when leaving
  // Control screen music: play title or character music depending on the active screen
  const titleMusic = document.getElementById('titleMusic');
  const charMusic = document.getElementById('characterMusic');
  const mapMusic = document.getElementById('mapMusic');

  if (titleMusic) {
    if (id === 'titleScreen') {
      titleMusic.play().catch(() => {});
    } else {
      titleMusic.pause();
      titleMusic.currentTime = 0;
    }
  }

  if (charMusic) {
    if (id === 'characterScreen') {
      console.log('[audio] showing character screen - attempting to play characterMusic');
      console.log('[audio] characterMusic.canPlayType(ogg)=', charMusic.canPlayType('audio/ogg'));
      try {
        charMusic.load();
      } catch (e) {
        console.warn('[audio] failed to call load() on characterMusic', e);
      }
      charMusic.muted = false;
      charMusic.volume = 0.9;
      charMusic.currentTime = 0;
      charMusic.play().then(() => {
        console.log('[audio] characterMusic started');
      }).catch((err) => {
        console.error('[audio] characterMusic play failed:', err);
      });
    } else {
      charMusic.pause();
      charMusic.currentTime = 0;
    }
  }

  if (mapMusic) {
    if (id === 'mapScreen') {
      mapMusic.volume = 0.9;
      mapMusic.currentTime = 0;
      mapMusic.play().catch((err) => {
        console.error('[audio] mapMusic play failed:', err);
      });
    } else {
      mapMusic.pause();
      mapMusic.currentTime = 0;
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startButton").addEventListener("click", () => {
    showScreen("characterScreen");
  });

  // Try to autoplay title music on load. Browsers may block autoplay; this attempts it.
  const tm = document.getElementById('titleMusic');
  if (tm) {
    tm.volume = 0.9;
    tm.play().catch((err) => {
      console.warn('Title music autoplay was blocked by the browser:', err);
    });
  }

  const charButtons = document.querySelectorAll("#characterButtons button");
  charButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      charButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.selectedCharacter = btn.dataset.char;
      // Immediately proceed to the map screen when a character is picked
      showScreen("mapScreen");
    });
  });


  document.getElementById("mapBackToChars").addEventListener("click", () => {
    showScreen("characterScreen");
  });

  const mapNodes = document.querySelectorAll(".map-node");
  mapNodes.forEach(node => {
    node.addEventListener("click", () => {
      const location = node.dataset.location;
      openSlideshow(location);
    });
  });

  document.getElementById("prevPhoto").addEventListener("click", () => {
    changeSlide(-1);
  });
  document.getElementById("nextPhoto").addEventListener("click", () => {
    changeSlide(1);
  });
  document.getElementById("backToMap").addEventListener("click", () => {
    showScreen("mapScreen");
  });
});

function openSlideshow(location) {
  state.currentLocation = location;
  state.slideIndex = 0;
  updateSlideshowImage();
  showScreen("slideshowScreen");
}

function updateSlideshowImage() {
  const list = state.slides[state.currentLocation];
  const img = document.getElementById("slideshowImage");
  img.src = list[state.slideIndex];
}

function changeSlide(delta) {
  const list = state.slides[state.currentLocation];
  state.slideIndex += delta;
  if (state.slideIndex < 0) state.slideIndex = list.length - 1;
  if (state.slideIndex >= list.length) state.slideIndex = 0;
  updateSlideshowImage();
}

// Position the van on the title screen so it lines up with the brown ground horizon.
function positionVanToHorizon() {
  const van = document.getElementById('vanSprite');
  const titleScreen = document.getElementById('titleScreen');
  const bgImg = titleScreen ? titleScreen.querySelector('.full-screen-image') : null;
  
  if (!van || !bgImg) return;
  
  // Get the background image natural dimensions to calculate where brown ground is
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
  const screenAspect = screenWidth / screenHeight;
  
  // Determine how the background image is scaled (object-fit: cover)
  let imgDisplayHeight, imgDisplayWidth, topOffset;
  
  if (imgAspect > screenAspect) {
    // Image wider than screen: height fills, width crops
    imgDisplayHeight = screenHeight;
    imgDisplayWidth = screenHeight * imgAspect;
    topOffset = 0;
  } else {
    // Image taller than screen: width fills, height crops
    imgDisplayWidth = screenWidth;
    imgDisplayHeight = screenWidth / imgAspect;
    topOffset = (screenHeight - imgDisplayHeight) / 2;
  }
  
  // Position van at ~78% down the image height (adjust if brown ground is at different %)
  const horizonPercent = 0.78; // where brown ground sits in the image
  const vanTopPixels = imgDisplayHeight * horizonPercent + topOffset;
  const vanBottomPixels = screenHeight - vanTopPixels;
  const vanBottomPercent = (vanBottomPixels / screenHeight) * 100;
  
  van.style.setProperty('--van-bottom', vanBottomPercent + '%');
}

// Run on load and on resize so the van stays aligned with brown ground
window.addEventListener('load', positionVanToHorizon);
window.addEventListener('resize', positionVanToHorizon);
