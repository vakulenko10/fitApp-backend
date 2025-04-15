export const askDeepseek = async (
  products,
  excludedProducts,
  calories,
  preferences,
  apiKey
) => {
  try {
    const token = apiKey || process.env.DEEPSEEK_API_KEY;

    // Format macronutrients for better AI understanding
    let formattedPreferences = preferences || "None";

    // Check if preferences contains macronutrient information
    if (formattedPreferences.includes("Macronutrients:")) {
      // Replace the standard format with a more structured version
      formattedPreferences = formattedPreferences.replace(
        /Macronutrients: Protein: (\d+)g, Fats: (\d+)g, Carbs: (\d+)g, Fiber: (\d+)g/,
        "Please follow these specific macronutrient targets: $1g protein, $2g fat, $3g carbs, $4g fiber."
      );
    }

    // Updated prompt that uses the formatted preference text
    const prompt = `
    I want you to create a daily meal plan with recipes for each meal. 
    Today, I want to eat these products: ${products.join(", ")}. 
    Please exclude these products from my meal plan: ${excludedProducts.join(
      ", "
    )}. 
    My goal is to consume ${calories} calories in total today.
    
    User preferences and additional instructions: ${formattedPreferences}
    
    Please create recipes for breakfast, lunch, and dinner that respect all these criteria.
    At the end of your response, include a nutrition summary showing total calories, protein, fat, carbs, and fiber content for the entire meal plan.`;

    // Sending a request to the DeepSeek API
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "HTTP-Referer": "https://www.sitename.com",
          "X-Title": "SiteName",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    // Handling the response
    const data = await response.json();
    console.log(data);

    // Extracting the markdown text or returning an error message if no valid response
    const markdownText =
      data.choices?.[0]?.message?.content || "No response received.";
    return markdownText;
  } catch (error) {
    console.error("Error:", error);
    return "Error generating meal plan.";
  }
};
