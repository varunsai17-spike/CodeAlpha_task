// DOM Element Selectors
const categoryPills = document.querySelectorAll("#categoryFilters .pill");
const effectPills = document.querySelectorAll("#effectFilters .pill");
const galleryContainer = document.getElementById("galleryContainer");
const cards = Array.from(document.querySelectorAll(".gallery-card"));

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxTag = document.getElementById("lightboxTag");
const closeBtn = document.getElementById("closeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let activeItems = [...cards];
let activeIndex = 0;

// Category Filtering with Smooth CSS State
categoryPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    categoryPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");

    const category = pill.dataset.filter;

    cards.forEach((card) => {
      const match = category === "all" || card.dataset.category === category;
      if (match) {
        card.classList.remove("hide");
      } else {
        card.classList.add("hide");
      }
    });

    activeItems = cards.filter((card) => !card.classList.contains("hide"));
  });
});

// Photo Effect/Filter Switching
effectPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    effectPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");

    // Remove existing effect classes
    galleryContainer.className = "gallery-container";
    const selectedEffect = pill.dataset.effect;
    if (selectedEffect !== "normal") {
      galleryContainer.classList.add(`effect-${selectedEffect}`);
    }
  });
});

// Lightbox Navigation Logic
function openLightbox(index) {
  if (activeItems.length === 0) return;
  activeIndex = (index + activeItems.length) % activeItems.length;

  const currentCard = activeItems[activeIndex];
  const img = currentCard.querySelector("img");
  const title = currentCard.querySelector("h3").textContent;
  const tag = currentCard.querySelector(".tag").textContent;

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxTitle.textContent = title;
  lightboxTag.textContent = tag;

  lightbox.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent page scrolling while open
}

function closeLightbox() {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
}

function showNext() {
  openLightbox(activeIndex + 1);
}

function showPrev() {
  openLightbox(activeIndex - 1);
}

// Event Listeners
cards.forEach((card) => {
  card.addEventListener("click", () => {
    const idx = activeItems.indexOf(card);
    if (idx !== -1) openLightbox(idx);
  });
});

closeBtn.addEventListener("click", closeLightbox);
nextBtn.addEventListener("click", showNext);
prevBtn.addEventListener("click", showPrev);

// Close when clicking empty dark area outside the image
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Full Keyboard Support (Esc, Left arrow, Right arrow)
window.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("active")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") showNext();
  if (e.key === "ArrowLeft") showPrev();
});