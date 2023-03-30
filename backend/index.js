const express = require("express");
const app = express();
const basicAuth = require('express-basic-auth')
const cors = require("cors");
const fs = require("fs");
var queue = require('express-queue');
const port = 4000;

require('dotenv').config({ 
	path: './.env', 
});

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(queue({ activeLimit: 5, queuedLimit: -1 }));
app.use(basicAuth({users: { 'admin': 'admin1234' }}))

const routes = fs.readdirSync('./routes').filter(route => route.endsWith('.js'));

routes.forEach((path) => {
	path = path.replace('.js', '');
	app.use(`/api/${path}`, require(`./routes/${path}`));
    console.log(`http://localhost:${port}/api/${path}`)
});


app.listen(port, () => {
	console.log(`Server is running on port: ${port}`);
});

