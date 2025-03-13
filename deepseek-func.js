// export const askDeepseek = async () =>{
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer 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`,
//           "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
//           "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           "model": "deepseek/deepseek-r1-zero:free",
//           "messages": [
//             {
//               "role": "user",
//               "content": "What is the meaning of life?"
//             }
//           ]
//         })
//       });
//       console.log('response in fetch',response)
// }
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