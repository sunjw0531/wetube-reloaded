import "regenerator-runtime";
// require("dotenv").config();
import "dotenv/config";

import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";

const port = 4000;


app.listen(port , ()=>{
    console.log(`Server listening on port http://localhost:${port}`);
});
