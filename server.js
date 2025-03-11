const express = require("express");
const { askDeepseek } = require("./deepseek-func");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Define a simple route
app.get("/", (req, res) => {
    res.send("Hello, Express!");
});
app.post("/deepseek/chat", async (req, res) => {
    try {
        console.log(req.body)
        const {products, calories} = req.body;
        const response = await askDeepseek(products, calories);
        console.log(response)
        res.json(response); 
    }
    catch(error){
        console.error("DeepSeek API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch response from DeepSeek API" });
    }
    
})
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
