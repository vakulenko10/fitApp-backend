export const askDeepseek = async (products, calories) =>{
try{
    const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'HTTP-Referer': 'https://www.sitename.com',
                'X-Title': 'SiteName',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1:free',
                messages: [{ role: 'user', content: `I want you to create a daily meal plan with recipes to each meal. Today I want to eat such products: ${products.join(', ')}. And I have a specific number of calories per day which is : ${calories}. I want you to create a recipe for breakfast, recipee for lunch and dinner` }],
            }),
        },
    );
    const data = await response.json();
    console.log(data);
    const markdownText =
        data.choices?.[0]?.message?.content || 'No response received.';
        return markdownText
    // responseDiv.innerHTML = marked.parse(markdownText);
}
catch(error){
 console.log(error)
}

}
