// js/calorie-calculator.js

document.addEventListener('DOMContentLoaded', () => {
    const calorieForm = document.getElementById('calorie-form');
    const calorieResultEl = document.getElementById('calorie-result');
    const openCalculatorBtn = document.getElementById('open-calorie-calculator');
    const calorieModal = document.getElementById('calorie-calculator-modal');
    const closeCalorieModalBtn = document.getElementById('close-calorie-modal');

    // User preferences (could be expanded with more inputs in the HTML form)
    let userPreferences = {
        diet: null, // e.g., 'vegetarian', 'vegan'
        macroFocus: 'balanced' // e.g., 'high_protein', 'low_carb'
    };

    if (openCalculatorBtn && calorieModal) {
        openCalculatorBtn.addEventListener('click', () => {
            calorieModal.classList.add('active');
            // Example: Add listeners if you add preference inputs
            // const dietPrefInput = document.getElementById('dietPreference');
            // if (dietPrefInput) userPreferences.diet = dietPrefInput.value;
        });
    }

    if (closeCalorieModalBtn && calorieModal && calorieResultEl) {
        closeCalorieModalBtn.addEventListener('click', () => {
            calorieModal.classList.remove('active');
            calorieResultEl.innerHTML = '';
            if (calorieForm) calorieForm.reset();
        });
    }

    if (calorieForm && calorieResultEl) {
        calorieForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const age = parseInt(document.getElementById('age').value);
            const gender = document.getElementById('gender').value;
            const weight = parseFloat(document.getElementById('weight').value); // weight in kg
            const height = parseInt(document.getElementById('height').value); // height in cm
            const activityFactor = parseFloat(document.getElementById('activity-level').value);
            const goal = document.getElementById('goal').value;

            // Update preferences if form has inputs for them
            // const dietPrefInput = document.getElementById('userDietPreference'); // Example ID
            // if (dietPrefInput && dietPrefInput.value) userPreferences.diet = dietPrefInput.value;
            // const macroFocusInput = document.getElementById('userMacroFocus'); // Example ID
            // if (macroFocusInput && macroFocusInput.value) userPreferences.macroFocus = macroFocusInput.value;


            if (!gender || !activityFactor || !goal) {
                 calorieResultEl.innerHTML = `<p style="color:var(--primary-color);">Please fill in all dropdown fields.</p>`;
                 return;
            }
            if (isNaN(age) || isNaN(weight) || isNaN(height) || age <= 0 || weight <= 0 || height <= 0) {
                calorieResultEl.innerHTML = `<p style="color:var(--primary-color);">Please enter valid age, weight, and height.</p>`;
                return;
            }

            // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
            let bmr;
            if (gender === 'male') {
                bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
            } else { // female
                bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
            }

            // Calculate TDEE (Total Daily Energy Expenditure)
            const tdee = bmr * activityFactor;
            let targetCalories = tdee;

            // Adjust calories based on goal
            if (goal === 'loss') {
                targetCalories -= 500; // Standard deficit for approx 0.5kg/week loss
            } else if (goal === 'gain') {
                targetCalories += 300; // Standard surplus for approx 0.5kg/week gain
            }

            // Ensure a minimum healthy calorie intake
            if (targetCalories < 1200 && gender === 'female') targetCalories = 1200;
            if (targetCalories < 1500 && gender === 'male') targetCalories = 1500;

            // Calculate BMI (Body Mass Index)
            // Formula: weight (kg) / [height (m)]^2
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);

            // Determine BMI category
            let bmiCategory = '';
            if (bmi < 18.5) {
                bmiCategory = 'Underweight';
            } else if (bmi >= 18.5 && bmi < 25) {
                bmiCategory = 'Healthy Weight';
            } else if (bmi >= 25 && bmi < 30) {
                bmiCategory = 'Overweight';
            } else {
                bmiCategory = 'Obese';
            }


            calorieResultEl.innerHTML = `
                <p>Your BMR is: ${bmr.toFixed(0)} kcal.</p>
                <p>Your TDEE is: ${tdee.toFixed(0)} kcal.</p>
                <p>Your BMI is: ${bmi.toFixed(1)} (${bmiCategory}).</p>
                <p>Recommended daily intake for ${goal.replace('_', ' ')}: <strong>${targetCalories.toFixed(0)} kcal</strong>.</p>
                <p><small>Note: This is an estimate. Consult a health professional for personalized advice.</small></p>
            `;

            localStorage.setItem('calorieRecommendation', JSON.stringify({
                target: targetCalories.toFixed(0),
                tdee: tdee.toFixed(0),
                bmr: bmr.toFixed(0),
                goal: goal,
                bmi: bmi.toFixed(1),
                bmiCategory: bmiCategory
            }));

            // Pass BMI and goal to the meal suggestion function
            await suggestMealsEnhanced(targetCalories, userPreferences, bmi, goal);
        });
    }
});

async function suggestMealsEnhanced(dailyTargetCalories, preferences, bmi, goal) {
    // Define meal calorie distribution (adjust percentages as needed)
    const mealDistribution = {
        breakfast: dailyTargetCalories * 0.25, // 25%
        lunch: dailyTargetCalories * 0.35,     // 35%
        dinner: dailyTargetCalories * 0.30,    // 30%
        snacks: dailyTargetCalories * 0.10     // 10% (can be one or two snacks)
    };

    const existingSuggestionsContainer = document.getElementById('meal-suggestions-container');
    if (existingSuggestionsContainer) {
        existingSuggestionsContainer.remove(); // Remove previous suggestions
    }

    const suggestionContainer = document.createElement('div');
    suggestionContainer.id = 'meal-suggestions-container';
    suggestionContainer.innerHTML = '<h3>Meal Suggestions (Examples):</h3>';
    suggestionContainer.style.marginTop = "15px";

    try {
        // getProductsGlobal is assumed to be available from products.js
        const products = await getProductsGlobal();
        if (!products || products.length === 0) {
            suggestionContainer.innerHTML += "<p>Could not load product data for suggestions.</p>";
            document.getElementById('calorie-result').appendChild(suggestionContainer);
            return;
        }

        // Filter products that have calorie and macro information
        const productsWithNutrition = products.filter(p =>
            p.calories !== undefined && p.macros &&
            p.macros.protein !== undefined && p.macros.carbs !== undefined && p.macros.fat !== undefined
        );

        if (productsWithNutrition.length === 0) {
            suggestionContainer.innerHTML += "<p>No products have sufficient nutritional information (calories & macros) for advanced suggestions.</p>";
            document.getElementById('calorie-result').appendChild(suggestionContainer);
            return;
        } else {
            for (const mealName in mealDistribution) {
                if (mealDistribution.hasOwnProperty(mealName)) {
                    const mealTargetCalories = mealDistribution[mealName];
                    // Pass BMI and goal to the combination finding function
                    const mealSuggestions = findMealCombinations(productsWithNutrition, mealTargetCalories, mealName, preferences, bmi, goal);
                    suggestionContainer.appendChild(createMealSuggestionHTMLAdvanced(mealName, mealSuggestions, mealTargetCalories));
                }
            }
        }
        document.getElementById('calorie-result').appendChild(suggestionContainer);
    } catch (error) {
        console.error("Error suggesting meals:", error);
        suggestionContainer.innerHTML += "<p>Error loading meal suggestions.</p>";
        document.getElementById('calorie-result').appendChild(suggestionContainer);
    }
}

// Enhanced function to find meal combinations based on calories, meal type, preferences, BMI, and goal
function findMealCombinations(allProducts, targetCalories, mealName, preferences, bmi, goal, maxItems = 3, attempts = 800) { // Increased attempts significantly
    let bestCombination = [];
    let minScore = Infinity; // Use a scoring system

    // Filter products based on meal type and dietary preferences
    let eligibleProducts = allProducts.filter(p => {
        // Check meal_type tag - allow 'side' for main meals, 'snack' for snacks
        const isCorrectMealType = p.meal_type && (
            p.meal_type.includes(mealName.toLowerCase()) ||
            (mealName !== "snacks" && p.meal_type.includes("side")) ||
            (mealName === "snacks" && p.meal_type.includes("snack"))
        );

        if (!isCorrectMealType) {
            return false;
        }

        // Check dietary preferences (e.g., vegetarian)
        if (preferences.diet && p.diet_tags && !p.diet_tags.includes(preferences.diet.toLowerCase())) {
            return false;
        }

        // Avoid suggesting only desserts for main meals unless it's a snack or part of a larger combo
        if ((mealName === "lunch" || mealName === "dinner" || mealName === "breakfast") && p.category === "Deserts" && maxItems === 1) {
             // Allow desserts as part of a multi-item meal, but not as the *only* item for main meals
             if (maxItems > 1) return true;
             return false;
        }

        // Add a basic filter based on BMI and Goal before attempting combinations
        if (bmi >= 25 && goal === 'loss') { // Overweight/Obese and trying to lose weight
            // Exclude very high-calorie items if trying to lose weight
            if (p.calories > 800) return false; // Example threshold
            // Prioritize lower-fat items (simple check)
             if (p.macros.fat > (p.macros.protein + p.macros.carbs) * 0.5) return false; // Example heuristic
        } else if (bmi < 18.5 && goal === 'gain') { // Underweight and trying to gain weight
            // Exclude very low-calorie items if trying to gain weight
             if (p.calories < 200) return false; // Example threshold
             // Prioritize higher-calorie/fat items (simple check)
             if (p.macros.fat < (p.macros.protein + p.macros.carbs) * 0.3) return false; // Example heuristic
        }


        return true;
    });

    if (eligibleProducts.length === 0) return [];

    // Sort eligible products by how close their calorie count is to the target meal calorie initially
    eligibleProducts.sort((a, b) => Math.abs(a.calories - targetCalories) - Math.abs(b.calories - targetCalories));


    // Attempt to build combinations
    for (let i = 0; i < attempts; i++) {
        let currentCombination = [];
        let currentCalories = 0;
        let currentProtein = 0;
        let currentCarbs = 0;
        let currentFat = 0;

        // Use a mix of the closest items and some random ones for variety. Increase the pool of items to consider.
        const itemsToConsider = eligibleProducts.slice(0, Math.min(25, eligibleProducts.length)); // Consider the 25 closest items
        const randomItems = eligibleProducts.slice(25).sort(() => 0.5 - Math.random()).slice(0, Math.min(25, eligibleProducts.length - 25)); // Add up to 25 random items
        const potentialItems = [...itemsToConsider, ...randomItems].sort(() => 0.5 - Math.random()); // Shuffle the combined list


        for (const product of potentialItems) {
            // Check if adding this product keeps the total calories within a reasonable range of the target
            // and doesn't exceed the max number of items.
            // Also, avoid adding the same item multiple times in a single combination attempt
            if (currentCombination.length < maxItems && currentCalories + product.calories <= targetCalories * 1.25 && !currentCombination.find(item => item.id === product.id)) { // Allow up to 25% overshoot for more flexibility
                 currentCombination.push(product);
                 currentCalories += product.calories;
                 currentProtein += product.macros.protein;
                 currentCarbs += product.macros.carbs;
                 currentFat += product.macros.fat;
            }
             // If we have reached the maximum number of items, stop adding more for this attempt
            if (currentCombination.length >= maxItems) break;
        }

        // Evaluate the combination if at least one item was added
        if (currentCombination.length > 0) {
            const calorieDifference = Math.abs(currentCalories - targetCalories);
            let currentScore = calorieDifference;

            // Add scoring based on BMI and Goal - Further increased impact
            if (bmi >= 25 && goal === 'loss') { // Overweight/Obese and trying to lose weight
                // Strongly penalize combinations significantly over calorie or high fat
                if (currentCalories > targetCalories * 1.15 || currentFat > (currentProtein + currentCarbs) * 0.7) { // Adjusted thresholds
                    currentScore += 100; // Increased penalty
                }
                // Reward higher protein relative to calories more significantly
                 currentScore -= (currentProtein / (currentCalories + 1)) * 100; // Increased reward

            } else if (bmi < 18.5 && goal === 'gain') { // Underweight and trying to gain weight
                // Strongly penalize combinations significantly below calorie target or low fat
                 if (currentCalories < targetCalories * 0.85 || currentFat < (currentProtein + currentCarbs) * 0.4) { // Adjusted thresholds
                     currentScore += 100; // Increased penalty
                 }
                // Reward higher calorie/fat combinations more significantly
                 currentScore -= (currentCalories / (targetCalories + 1)) * 70; // Increased reward
                 currentScore -= (currentFat / (currentCalories + 1)) * 70; // Increased reward

            }
            // Add macro focus scoring (can be more sophisticated) - Also increased impact
            if (preferences.macroFocus === 'high_protein' && currentProtein < (currentCarbs + currentFat) / 2 * 0.6) currentScore += 80; // Increased penalty if protein is significantly lower
            if (preferences.macroFocus === 'low_carb' && currentCarbs > (currentProtein + currentFat) / 2 * 1.4) currentScore += 80; // Increased penalty if carbs are significantly higher


            if (currentScore < minScore) {
                minScore = currentScore;
                // Store the total macros and calories with the combination
                bestCombination = currentCombination.map(p => ({...p, totalMealCalories: currentCalories, totalMealMacros: {protein: currentProtein, carbs: currentCarbs, fat: currentFat}}));
            }
        }
         // If a combination is found that is very close to the target and has a good score, we can stop early
         if (minScore < 10 && bestCombination.length > 0) break; // Lower the threshold for a good enough match based on score
    }

    // If no combination was found after attempts, try suggesting a single item closest to the target
    if (bestCombination.length === 0 && eligibleProducts.length > 0) {
        let singleItem = eligibleProducts.reduce((prev, curr) => {
            return (Math.abs(curr.calories - targetCalories) < Math.abs(prev.calories - targetCalories) ? curr : prev);
        });
         // Only suggest a single item if its calories are somewhat close to the target (adjusted threshold)
         if (Math.abs(singleItem.calories - targetCalories) < targetCalories * 0.8) { // Only suggest if within 80% of target
             bestCombination = [{...singleItem, totalMealCalories: singleItem.calories, totalMealMacros: singleItem.macros}];
         }
    }


    return bestCombination;
}


// Helper function to create the HTML for meal suggestions
function createMealSuggestionHTMLAdvanced(mealName, items, targetCalories) {
    const mealDiv = document.createElement('div');
    mealDiv.style.marginBottom = '15px';
    mealDiv.style.padding = '10px';
    mealDiv.style.border = '1px solid var(--grey-color)';
    mealDiv.style.borderRadius = '5px';

    let itemsHTML = "";
    let mealTotalCalories = 0;
    let mealTotalMacros = { protein: 0, carbs: 0, fat: 0 };

    if (!items || items.length === 0) {
        itemsHTML = `<li>No specific combination found for ${mealName} around ${targetCalories.toFixed(0)} kcal. Try adjusting preferences or browse our <a href="#recipes" style="color: var(--primary-color); text-decoration: underline;">menu</a>.</li>`;
    } else {
        items.forEach(item => {
            itemsHTML += `<li>${item.title} (${item.calories} kcal) - P: ${item.macros.protein.toFixed(0)}g, C: ${item.macros.carbs.toFixed(0)}g, F: ${item.macros.fat.toFixed(0)}g</li>`;
        });
        // Get totals from the first item (as they are stored there by findMealCombinations)
        mealTotalCalories = items[0].totalMealCalories;
        mealTotalMacros = items[0].totalMealMacros;
    }

    mealDiv.innerHTML = `
        <h4 style="margin-bottom: 5px; color: var(--black-color); text-transform: capitalize;">${mealName} (Target: ~${targetCalories.toFixed(0)} kcal)</h4>
        <ul>${itemsHTML}</ul>
        ${(items && items.length > 0) ?
            `<p style="margin-top: 8px; font-size: 1.3rem;">
                <strong>Suggestion Total: ${mealTotalCalories.toFixed(0)} kcal</strong><br/>
                (Protein: ${mealTotalMacros.protein.toFixed(0)}g, Carbs: ${mealTotalMacros.carbs.toFixed(0)}g, Fat: ${mealTotalMacros.fat.toFixed(0)}g)
             </p>` : ''}
    `;
    return mealDiv;
}

// Ensure getProductsGlobal is defined in products.js and loaded before this script,
// or define it here if it's not globally available from products.js.
// async function getProductsGlobal() { /* ... fetch products ... */ }
