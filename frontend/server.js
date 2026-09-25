const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/health", (req, res) => {
    res.json({
        status: "UP",
        application: "shopsphere-frontend"
    });
});

app.listen(PORT, () => {
    console.log(`ShopSphere frontend running on port ${PORT}`);
});