const apiKey = "c050155267d244d581c764bcf509ebe0";
const recipeList = document.getElementById("recipe-list");
const input = document.getElementById("ingredients");

async function findRecipes(ingredients = "") {
  let query = ingredients ? encodeURIComponent(ingredients) : "chicken"; // default suggestions
  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=8&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();

    recipeList.innerHTML = "";
    if (!data || data.length === 0) {
      recipeList.innerHTML = "<p>No recipes found. Try different ingredients.</p>";
      return;
    }

    data.forEach(recipe => {
      const recipeCard = document.createElement("div");
      recipeCard.classList.add("recipe");
      recipeCard.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${recipe.title}</h3>
        <button onclick="viewRecipe(${recipe.id})">View Recipe</button>
      `;
      recipeList.appendChild(recipeCard);
    });

  } catch (error) {
    console.error("Error fetching recipes:", error);
    recipeList.innerHTML = "<p>Failed to load recipes.</p>";
  }
}

// Auto-suggest while typing (debounce 500ms)
let debounceTimeout;
input.addEventListener("input", function () {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => findRecipes(input.value.trim()), 500);
});

// Load default suggestions on page load
window.addEventListener("DOMContentLoaded", () => findRecipes());

// Modal functions (same as before)
async function viewRecipe(id) {
  const modal = document.getElementById("recipe-modal");
  const modalDetails = document.getElementById("modal-details");
  modal.style.display = "block";
  modalDetails.innerHTML = "<p>Loading...</p>";

  const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const recipe = await response.json();

    let equipmentSet = new Set();
    if (recipe.analyzedInstructions) {
      recipe.analyzedInstructions.forEach(instr => {
        instr.steps.forEach(step => {
          if (step.equipment) step.equipment.forEach(eq => equipmentSet.add(eq.name));
        });
      });
    }

    modalDetails.innerHTML = `
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}" style="width:100%; border-radius: 12px; margin-bottom: 15px;">
      <p><strong>Servings:</strong> ${recipe.servings}</p>
      <p><strong>Ready in:</strong> ${recipe.readyInMinutes} minutes</p>
      <h4>Ingredients:</h4>
      <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join("")}</ul>
      <h4>Equipment Needed:</h4>
      <ul>${[...equipmentSet].map(eq => `<li>${eq}</li>`).join("") || "<li>No special equipment needed</li>"}</ul>
      <h4>Instructions:</h4>
      <p>${recipe.instructions || "No instructions available."}</p>
    `;
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    modalDetails.innerHTML = "<p>Failed to load recipe details.</p>";
  }
}

function closeModal() {
  document.getElementById("recipe-modal").style.display = "none";
}

window.onclick = function(event) {
  const modal = document.getElementById("recipe-modal");
  if (event.target === modal) modal.style.display = "none";
}
