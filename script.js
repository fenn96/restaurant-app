const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById("meal-popup");
const mealHeader = document.getElementById("meal-header");
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");

const searchTerm = document.getElementById("search-term");

// Get Random Meal and Favorite Meals
getRandomMeal();
fetchFavMeals();

// Get Random Meal from API
async function getRandomMeal() {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/random.php"
    );
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    addMeal(randomMeal, true);
}

// Get Meal using ID from API
async function getMealById(id) {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
    );

    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

// Get List of Meals that match search from API
async function getMealsBySearch(term) {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
    );

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

// Add Meal Info to HTML
function addMeal(mealData, random = false) {
    console.log(mealData);

    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
        <div class="meal-header">
            ${
                random
                    ? `
            <span class="random"> Random Recipe </span>
            <button class="random-btn">
            <span class="material-symbols-outlined">
            autorenew
            </span></button>`
                    : ""
            }
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
            <span class="material-symbols-outlined">
            favorite
            </span>
            </button>
        </div>
    `;

    // If the Meal is a Random Meal then add a button to get a new Random Meal on click of button
    if(random) {
        const randomBtn = meal.querySelector(".random-btn");

        randomBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            meals.innerHTML = "";
            getRandomMeal();
        });
    }

    const btn = meal.querySelector(".fav-btn");

    // Listener to add Meal to Favorite Meal Local Storage on favorite button click
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (btn.classList.contains("active")) {
            removeMealLS(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealLS(mealData.idMeal);
            btn.classList.add("active");
        }

        fetchFavMeals();
    });

    // Listener to show Meal Ingredients/Info popup on click of Meal container
    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

// Add Meal ID to local storage
function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

// Remove Meal ID from local storage
function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );
}

// Get Meal IDs from local storage
function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

// Fetch Favorite Meals from Local Storage
async function fetchFavMeals() {
    // clean the container
    favoriteContainer.innerHTML = "";

    const mealIds = getMealsLS();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);

        addMealFav(meal);
    }
}

// Add Favorite Meal Info to HTML
function addMealFav(mealData) {
    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        /><span>${mealData.strMeal}</span>
        <button class="clear"><span class="material-symbols-outlined">
        cancel
        </span></button>
    `;

    const btn = favMeal.querySelector(".clear");

    // Listener to remove meal from Favorite Meal Local Storage on click of X button
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeMealLS(mealData.idMeal);

        fetchFavMeals();
    });

    // Listener to show Meal Ingredients/Info of Favorite Meal on click of Meal container
    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    favoriteContainer.appendChild(favMeal);
}

// Add Meal Ingredients/Info to HTML popup
function showMealInfo(mealData) {
    // clean it up
    mealInfoEl.innerHTML = "";

    // update the Meal info
    const mealEl = document.createElement("div");

    const ingredients = [];

    // get ingredients and measures
    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient" + i]) {
            ingredients.push(
                `${mealData["strIngredient" + i]} - ${
                    mealData["strMeasure" + i]
                }`
            );
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        />
        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients
                .map(
                    (ing) => `
            <li>${ing}</li>
            `
                )
                .join("")}
        </ul>
    `;

    mealInfoEl.appendChild(mealEl);

    // show the popup
    mealPopup.classList.remove("hidden");
}

// Listener to get search term to search for Meals
searchTerm.addEventListener("keypress", async (e) => {
    const search = searchTerm.value;
    if (e.key === 'Enter' && search != "") {
        // clean container
        mealsEl.innerHTML = "";

        const meals = await getMealsBySearch(search);

        if (meals) {
            meals.forEach((meal) => {
                addMeal(meal);
            });
        } else {
            mealsEl.innerHTML = `<h3>No search results found for '${search}'.</h3>`
        }
    }
});

// Listener to close popup on click
popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});