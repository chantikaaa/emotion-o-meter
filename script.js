const btn = document.querySelector(".nes-btn");
const input = document.querySelector(".nes-input");
const resultText = document.querySelector(".result-text");
const moodLabel = document.querySelector(".mood-label");
const alsoFeelsElement = document.querySelector(".also-feels");
const ratingNum = document.querySelector(".rating-num");

// Load CSV dulu
let movieData = [];
Papa.parse("data/dataset_enriched_with_moods.csv", {
  download: true,
  header: true,
  complete: (results) => {
    movieData = results.data;
  },
});

function emotionMeter(titleQuery) {
  // Search for movie
  const movie = movieData.find((m) =>
    m.title.toLowerCase().includes(titleQuery.toLowerCase()),
  );

  if (!movie) {
    resultText.innerHTML = `<span style="color: red;">Film '${titleQuery}' tidak ditemukan.</span>`;
    moodLabel.textContent = "...";
    ratingNum.textContent = "-";
    return;
  }

  // Parse genres from JSON string
  let genreNames = "";
  try {
    const genres = JSON.parse(movie.genres);
    genreNames = genres.map((g) => g.name).join(", ");
  } catch (e) {
    genreNames = movie.genres;
  }

  // Parse top3_complex_moods
  let top3Moods = [];
  try {
    top3Moods = JSON.parse(movie.top3_complex_moods);
    // Skip first element and get the rest
    top3Moods = top3Moods.slice(1);
  } catch (e) {
    // Fallback: try parsing as string array
    const match = movie.top3_complex_moods.match(/'([^']+)'/g);
    if (match) {
      top3Moods = match.map((m) => m.slice(1, -1)).slice(1);
    }
  }

  // Display result
  const year = movie.release_year ? ` (${Math.floor(movie.release_year)})` : "";
  resultText.textContent = `${movie.title}${year}`;

  moodLabel.textContent = `This is a ${movie.complex_mood} movie`;

  if (top3Moods.length > 0) {
    alsoFeelsElement.textContent = `Also feels: ${top3Moods.join(", ")}`;
  } else {
    alsoFeelsElement.textContent = "";
  }

  ratingNum.textContent = movie.vote_average;
}

btn.addEventListener("click", () => {
  const query = input.value.trim();
  if (query) {
    emotionMeter(query);
  }
});

// Allow Enter key to search
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    btn.click();
  }
});
