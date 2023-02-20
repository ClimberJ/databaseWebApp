const express = require('express');
const router = express.Router();
const pg = require('pg')

router.get("/", async (req, res) => {
    console.log(`New GET request from ${req.ip} on endpoint /locations`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const { rows } = await db.query({
            text: 'SELECT * FROM location \
            ORDER BY location_id ASC'
        });
        await res.status(200).json({
            rows,
        });
        if (rows.length == 1) {
            console.log(rows.length + " row found.")
        }
        else {
            console.log(rows.length + " rows found.")
        }
        console.log("Response sent.")
        db.end();
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.get("/search", async (req, res) => {
    console.log(`New GET request with parameters from ${req.ip} on endpoint /components`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();

        var query = {};

        Object.keys(req.query).forEach(key => {
            query[key] = decodeURIComponent(req.query[key]);
        })

        var queryStrings = [];

        Object.keys(query).forEach(element => {
            if (query[element] != "NaN" && query[element] != "") {
                if (parseInt(query[element]) > 0) {
                    queryStrings.push(element + ` = ` + query[element]);
                    console.log("Is number")
                } else {
                    queryStrings.push(element + ` LIKE '%` + query[element] + `%'`);
                    console.log("Is not number")
                }
            };
        });

        var queryString = "SELECT * FROM location "

        if (queryStrings.length > 0) {
            queryString = [queryString, "WHERE", queryStrings.join(" AND ")].join(" ");
        }
        queryString = queryString + " ORDER BY location_id ASC";

        console.log(queryStrings);
        console.log(queryString);

        const { rows } = await db.query({
            text: queryString
        });
        await res.status(200).json({
            rows,
        });
        if (rows.length == 1) {
            console.log(rows.length + " row found.")
        }
        else {
            console.log(rows.length + " rows found.")
        }
        console.log("Response sent.")
        db.end();


    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
});

router.get("/:id", async (req, res) => {
    console.log(`New GET request with id ${req.params.id} from ${req.ip} on endpoint /locations`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const { rows } = await db.query({
            text: 'SELECT * FROM location \
            WHERE location_id = $1 \
            ORDER BY location_id ASC',
            values: [
                req.params.id
            ]
        });
        await res.status(200).json({
            rows,
        });
        if (rows.length == 1) {
            console.log(rows.length + " row found.")
        }
        else {
            console.log(rows.length + " rows found.")
        }
        console.log("Response sent.")
        db.end();
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.post("/", async (req, res) => {
    console.log(`New POST request from ${req.ip} on endpoint /locations`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const {
            location_name
        } = req.body;

        const maxLocation_id = await db.query("SELECT MAX(location_id) FROM location");

        await db.query({
            text: `INSERT INTO location (
                location_id,
                location_name
            ) VALUES ($1, $2);`,
            values: [
                maxLocation_id.rows[0].max + 1,
                location_name
            ]
        });

        res.status(201).json({
            message: "Successfully created location",
            new_location_id: maxLocation_id.rows[0].max + 1
        })
        console.log("Response sent")
        db.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
});

router.delete("/", async (req, res) => {
    console.log(`New DELETE request from ${req.ip} on endpoint /locations`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const {
            id: id
        } = req.body;

        var count = await db.query("SELECT COUNT(*) FROM location WHERE location_id = " + id);

        if (count = 0) {
            res.status(404).json({
                message: "Location not found",
            })
        }

        await db.query({
            text: `DELETE FROM location WHERE location_id = ` + id,
        });

        res.status(200).json({
            message: "Successfully deleted location",
        })
        console.log("Response sent")
        db.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
});

router.patch("/", async (req, res) => {
    console.log(`New PUT request from ${req.ip} on endpoint /locations`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();

        const {
            id: id
        } = req.body;

        var items = [];

        const keys = Object.keys(req.body);
        keys.forEach(key => {
            if (key != "id") {
                const value = req.body[key];
                items.push(key + " = \'" + value + "\'");
            };
        });

        var count = await db.query("SELECT COUNT(*) FROM location WHERE location_id = " + id);

        if (count = 0) {
            res.status(404).json({
                message: "Location not found",
            })
        }

        await db.query({
            text: `UPDATE location SET ` + items.join(", ") + ` WHERE location_id = ` + id
        });

        res.status(200).json({
            message: "Successfully updated location",
        })
        console.log("Response sent")
        db.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
});

module.exports = router;