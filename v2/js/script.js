document.addEventListener('DOMContentLoaded', () => {
  const favorites = getFavorites();

  document.querySelectorAll('.card').forEach(card => {
      const link = card.querySelector('a')?.getAttribute('href');
      const heart = card.querySelector('.fa-heart');
      const fav = favorites.some(f => f.id === link);

      heart.classList.replace(fav ? 'fa-regular' : 'fa-solid', fav ? 'fa-solid' : 'fa-regular');
  });

  updateFavoritesList(favorites);
});

function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function addToFavorites(e) {
  e.preventDefault();

  const heart = e.currentTarget;
  const card = heart.closest('.card');
  const a = card.querySelector('a');
  const img = card.querySelector('img');
  const desc = card.querySelector('p');

  const recipe = {
      id: a?.getAttribute('href') || '',
      title: a?.textContent.trim() || '',
      link: a?.href || '',
      image: img?.src || '',
      description: desc?.textContent.trim() || ''
  };

  if (Object.values(recipe).some(val => !val)) {
      alert('This recipe is missing information and cannot be added to favorites.');
      console.log('Recipe details:', recipe);
      return;
  }

  let favorites = getFavorites();
  const exists = favorites.some(f => f.id === recipe.id);

  if (exists) {
      favorites = favorites.filter(f => f.id !== recipe.id);
      heart.classList.replace('fa-solid', 'fa-regular');
      alert('The recipe has been removed from your favorites');
  } else {
      favorites.push(recipe);
      heart.classList.replace('fa-regular', 'fa-solid');
      alert('The recipe has been added to your favorites! ♥');
  }

  saveFavorites(favorites);
  updateFavoritesList(favorites);
}

function removeFromFavorites(id) {
  let favorites = getFavorites().filter(f => f.id !== id);
  saveFavorites(favorites);

  document.querySelectorAll('.card').forEach(card => {
      const link = card.querySelector('a')?.getAttribute('href');
      if (link === id) {
          card.querySelector('.fa-heart')?.classList.replace('fa-solid', 'fa-regular');
      }
  });

  updateFavoritesList(favorites);
}

function updateFavoritesList(favorites) {
  const list = document.getElementById('favorites-list');
  list.innerHTML = favorites.length
      ? favorites.map(f => `
          <div class="favorite-item">
              <img src="${f.image}" alt="${f.title}" onerror="this.src='img/default-recipe.jpg'">
              <div class="favorite-content">
                  <h3><a href="${f.link}">${f.title}</a></h3>
                  <p>${f.description}</p>
                  <button onclick="removeFromFavorites('${f.id}')">
                      <i class="fa-regular fa-trash"></i> Remove
                  </button>
              </div>
          </div>
      `).join('')
    :` <div class="empty-favorites"><p>Click ♥ to add your favorite recipes</p></div>`;
}

//add new recipe
document.addEventListener("DOMContentLoaded", () => {
  window.addIngredient = function() {
    const ingredientsDiv = document.getElementById("ingredients");
    if (ingredientsDiv) {
      const newIngredientGroup = document.createElement("div");
      newIngredientGroup.className = "ingredient-group";
      newIngredientGroup.innerHTML = `
        <input type="text" name="ingredientName[]" placeholder="Name" required />
        <input type="text" name="ingredientQty[]" placeholder="Quantity" required />
      `;
      ingredientsDiv.insertBefore(newIngredientGroup, ingredientsDiv.querySelector("button"));
    }
  };

  
  const form = document.getElementById("recipeForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("recipeName").value.trim();
      const course = document.getElementById("course").value.trim().toLowerCase();
      const description = document.getElementById("description").value.trim();
      const imageUrl = document.getElementById("imageUrl").value.trim();
      const directions = document.getElementById("directions").value.trim();

      const ingredients = [];
      const ingredientNames = document.querySelectorAll('input[name="ingredientName[]"]');
      const ingredientQtys = document.querySelectorAll('input[name="ingredientQty[]"]');

      for (let i = 0; i < ingredientNames.length; i++) {
        const name = ingredientNames[i].value.trim();
        const qty = ingredientQtys[i].value.trim();

        if (name && qty) {
          ingredients.push({ name, quantity: qty });
        }
      }

      const newRecipe = {
        name,
        course,
        description,
        directions,
        ingredients,
        image: imageUrl || "img/default.jpg",
      };

      const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
      recipes.push(newRecipe);
      localStorage.setItem("recipes", JSON.stringify(recipes));

      alert("Recipe added successfully!");

      if (course.includes("dessert")) {
        window.location.href = "admin_dessert.html";
      } else if (course.includes("main")) {
        window.location.href = "admin_maindish.html";
      } else if (course.includes("appetizer")) {
        window.location.href = "admin_appetizer.html";
      } else {
        window.location.href = "index.html";
      }
    });
  }

  
  const recipesContainer = document.querySelector(".content-cards");
  if (recipesContainer) {
    const coursePage = document.title.toLowerCase();
    const recipes = JSON.parse(localStorage.getItem("recipes")) || [];

    recipes.forEach((recipe, index) => {
      const recipeCourse = recipe.course.toLowerCase();

      if (
        (coursePage.includes("dessert") && recipeCourse === "dessert") ||
        (coursePage.includes("main") && recipeCourse === "main course") ||
        (coursePage.includes("appetizer") && recipeCourse === "appetizer")
      ) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <div class="img-card">
            <img src="${recipe.image}" alt="${recipe.name}">
          </div>
          <div class="card-content">
            <p><a href="recipe_detail.html?index=${index}">${recipe.name}</a></p>
            <p>${recipe.description}</p>
          </div>
        `;
        recipesContainer.appendChild(card);
      }
    });
  }


  // Recipe detail page 
  const recipeIngredientsElement = document.getElementById("recipe-ingredients");
  const recipeImageElement = document.getElementById("recipe-image");

  if (recipeIngredientsElement && recipeImageElement) {
    const params = new URLSearchParams(window.location.search);
    const index = params.get("index");

    if (index !== null) {
      const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
      const recipe = recipes[index];

      if (recipe) {
        recipeImageElement.src = recipe.image || "img/default.jpg";
        recipeImageElement.alt = recipe.name;
        document.getElementById("recipe-name").textContent = recipe.name;
        document.getElementById("recipe-description").textContent = recipe.description;

        const ingredientsList = document.getElementById("recipe-ingredients");
        ingredientsList.innerHTML = "";

        if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
          recipe.ingredients.forEach(ingredient => {
            const li = document.createElement("li");
            const name = ingredient.name || "Unnamed";
            const qty = ingredient.quantity || "";
            li.textContent = `${qty} ${name}`.trim();
            ingredientsList.appendChild(li);
          });
        } else {
          ingredientsList.innerHTML = "<li>No ingredients listed.</li>";
        }

        const directions = document.getElementById("recipe-directions");
        directions.innerHTML = recipe.directions
          ? recipe.directions.replace(/\n/g, "<br>")
          : "No directions provided.";
      }
    }
  }

  // Manage recipe page 
  const recipeList = document.getElementById("recipeList");
  if (recipeList) {
    window.addEditIngredient = function(index, containerId) {
      const container = document.getElementById(containerId);
      const newRow = document.createElement("div");
      newRow.className = "ingredient-edit-row";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = `ingredient-name-${index}`;
      nameInput.placeholder = "Name";

      const qtyInput = document.createElement("input");
      qtyInput.type = "text";
      qtyInput.className = `ingredient-qty-${index}`;
      qtyInput.placeholder = "Quantity";

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-ingredient-btn";
      removeBtn.textContent = "✕";
      removeBtn.onclick = function() {
        container.removeChild(newRow);
      };

      newRow.appendChild(nameInput);
      newRow.appendChild(qtyInput);
      newRow.appendChild(removeBtn);
      container.appendChild(newRow);
    };

    function renderRecipes() {
      recipeList.innerHTML = "";
      const recipes = JSON.parse(localStorage.getItem("recipes")) || [];

      recipes.forEach((recipe, index) => {
        const recipeCard = document.createElement("div");
        recipeCard.className = "recipe-card";

        const details = document.createElement("div");
        details.className = "recipe-details";

        const buttons = document.createElement("div");
        buttons.className = "recipe-buttons";

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";

        const saveBtn = document.createElement("button");
        saveBtn.className = "save-btn";
        saveBtn.textContent = "Save";
        saveBtn.style.display = "none";

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "cancel-btn";
        cancelBtn.textContent = "Cancel";
        cancelBtn.style.display = "none";

        function renderDetails() {
          let ingredientsHtml = '<p><strong>Ingredients:</strong></p><ul>';

          if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach(ingredient => {
              ingredientsHtml += `<li>${ingredient.quantity} ${ingredient.name}</li>`;
            });
          } else {
            ingredientsHtml += '<li>No ingredients listed</li>';
          }
          ingredientsHtml += '</ul>';

          details.innerHTML = `
            <h3>${recipe.name}</h3>
            <p><strong>Course:</strong> ${recipe.course}</p>
            <p><strong>Description:</strong> ${recipe.description}</p>
            ${ingredientsHtml}
            <p><strong>Directions:</strong><br>${recipe.directions?.split("\n").map(line => `<div>${line}</div>`).join("") || "N/A"}</p>
          `;
        }

        function renderEditForm() {
          details.innerHTML = `
            <input type="text" value="${recipe.name}" id="name-${index}" placeholder="Recipe Name">
            <select id="course-${index}">
              <option value="dessert" ${recipe.course === "dessert" ? "selected" : ""}>Dessert</option>
              <option value="appetizer" ${recipe.course === "appetizer" ? "selected" : ""}>Appetizer</option>
              <option value="main course" ${recipe.course === "main course" ? "selected" : ""}>Main Dish</option>
            </select>
            <textarea id="description-${index}" placeholder="Description">${recipe.description || ""}</textarea>
            <input type="text" value="${recipe.image || ''}" id="image-${index}" placeholder="Image URL">
            <div class="edit-ingredients">
              <h4>Ingredients</h4>
              <div id="ingredients-container-${index}" class="ingredients-container"></div>
              <button type="button" onclick="addEditIngredient(${index}, 'ingredients-container-${index}')">+ Add Ingredient</button>
            </div>
            <textarea id="directions-${index}" placeholder="Directions">${recipe.directions || ""}</textarea>
          `;

          const ingredientsContainer = document.getElementById(`ingredients-container-${index}`);

          if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
            recipe.ingredients.forEach(ingredient => {
              const row = document.createElement("div");
              row.className = "ingredient-edit-row";

              const nameInput = document.createElement("input");
              nameInput.type = "text";
              nameInput.className = `ingredient-name-${index}`;
              nameInput.value = ingredient.name || "";
              nameInput.placeholder = "Name";

              const qtyInput = document.createElement("input");
              qtyInput.type = "text";
              qtyInput.className = `ingredient-qty-${index}`;
              qtyInput.value = ingredient.quantity || "";
              qtyInput.placeholder = "Quantity";

              const removeBtn = document.createElement("button");
              removeBtn.type = "button";
              removeBtn.className = "remove-ingredient-btn";
              removeBtn.textContent = "✕";
              removeBtn.onclick = function() {
                ingredientsContainer.removeChild(row);
              };

              row.appendChild(nameInput);
              row.appendChild(qtyInput);
              row.appendChild(removeBtn);
              ingredientsContainer.appendChild(row);
            });
          } else {
            addEditIngredient(index, `ingredients-container-${index}`);
          }
        }

        editBtn.addEventListener("click", () => {
          renderEditForm();
          editBtn.style.display = "none";
          deleteBtn.style.display = "none";
          saveBtn.style.display = "inline-block";
          cancelBtn.style.display = "inline-block";
        });

        saveBtn.addEventListener("click", () => {
          const newName = document.getElementById(`name-${index}`).value;
          const newCourse = document.getElementById(`course-${index}`).value;
          const newDesc = document.getElementById(`description-${index}`).value;
          const newImage = document.getElementById(`image-${index}`).value;
          const newDirections = document.getElementById(`directions-${index}`).value;

          const ingredientNames = document.querySelectorAll(`.ingredient-name-${index}`);
          const ingredientQtys = document.querySelectorAll(`.ingredient-qty-${index}`);
          const newIngredients = [];

          for (let i = 0; i < ingredientNames.length; i++) {
            const name = ingredientNames[i].value.trim();
            const quantity = ingredientQtys[i].value.trim();

            if (name || quantity) {
              newIngredients.push({ name, quantity });
            }
          }

          recipes[index] = {
            ...recipes[index],
            name: newName,
            course: newCourse,
            description: newDesc,
            image: newImage,
            directions: newDirections,
            ingredients: newIngredients
          };

          localStorage.setItem("recipes", JSON.stringify(recipes));
          renderRecipes();
        });

        cancelBtn.addEventListener("click", () => {
          renderRecipes();
        });

        deleteBtn.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this recipe?")) {
            recipes.splice(index, 1);
            localStorage.setItem("recipes", JSON.stringify(recipes));
            renderRecipes();
          }
        });

        renderDetails();

        buttons.appendChild(editBtn);
        buttons.appendChild(deleteBtn);
        buttons.appendChild(saveBtn);
        buttons.appendChild(cancelBtn);

        recipeCard.appendChild(details);
        recipeCard.appendChild(buttons);
        recipeList.appendChild(recipeCard);
      });
    }

    renderRecipes();
  }
});
