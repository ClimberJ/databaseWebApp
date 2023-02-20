const express = require('express');
const router = express.Router();
const pg = require('pg')

router.get("/", async (req, res) => {
    console.log(`New GET request from ${req.ip} on endpoint /componenttypes`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const { rows } = await db.query({
            text: 'SELECT * FROM component_type \
            ORDER BY component_type_id ASC'
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

        var queryString = "SELECT * FROM component_type "

        if (queryStrings.length > 0) {
            queryString = [queryString, "WHERE", queryStrings.join(" AND ")].join(" ");
        }
        queryString = queryString + " ORDER BY component_type_id ASC";

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
    console.log(`New GET request with id ${req.params.id} from ${req.ip} on endpoint /componenttypes`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const { rows } = await db.query({
            text: 'SELECT * FROM component_type \
            WHERE component_type_id = $1 \
            ORDER BY component_type_id ASC',
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
    console.log(`New POST request from ${req.ip} on endpoint /componenttypes`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const {
            component_type_name
        } = req.body;

        const maxComponent_type_id = await db.query("SELECT MAX(component_type_id) FROM component_type");

        await db.query({
            text: `INSERT INTO component_type (
                component_type_id,
                component_type_name
            ) VALUES ($1, $2);`,
            values: [
                maxComponent_type_id.rows[0].max + 1,
                component_type_name
            ]
        });

        res.status(201).json({
            message: "Successfully created component_type",
            new_component_type_id: maxComponent_type_id.rows[0].max + 1
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
    console.log(`New DELETE request from ${req.ip} on endpoint /componenttypes`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const {
            id: id
        } = req.body;

        var count = await db.query("SELECT COUNT(*) FROM component_type WHERE component_type_id = " + id);

        if (count = 0) {
            res.status(404).json({
                message: "Component type not found",
            })
        }

        await db.query({
            text: `DELETE FROM component_type WHERE component_type_id = ` + id,
        });

        res.status(200).json({
            message: "Successfully deleted component type",
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
    console.log(`New PUT request from ${req.ip} on endpoint /componenttypes`);
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

        var count = await db.query("SELECT COUNT(*) FROM component_type WHERE component_type_id = " + id);

        if (count = 0) {
            res.status(404).json({
                message: "Location not found",
            })
        }

        await db.query({
            text: `UPDATE component_type SET ` + items.join(", ") + ` WHERE component_type_id = ` + id
        });

        res.status(200).json({
            message: "Successfully updated component type",
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