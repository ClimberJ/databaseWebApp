const express = require('express');
const router = express.Router();
const pg = require('pg')

router.get("/", async (req, res) => {
    console.log(`New GET request from ${req.ip} on endpoint /ports`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const { rows } = await db.query({
            text: 'SELECT p.*, c.component_name, h.host_name FROM port p \
            INNER JOIN network_component c ON p.port_component = c.component_id \
            INNER JOIN host h ON p.port_host = h.host_id \
            ORDER BY port_id ASC'
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

        var queryString = "SELECT p.*, c.component_name, h.host_name FROM port p \
        INNER JOIN network_component c ON p.port_component = c.component_id \
        INNER JOIN host h ON p.port_host = h.host_id "

        if (queryStrings.length > 0) {
            queryString = [queryString, "WHERE", queryStrings.join(" AND ")].join(" ");
        }
        queryString = queryString + " ORDER BY port_id ASC";

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
    console.log(`New GET request with id ${req.params.id} from ${req.ip} on endpoint /ports`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const { rows } = await db.query({
            text: 'SELECT p.*, c.component_name, h.host_name FROM port p \
            INNER JOIN network_component c ON p.port_component = c.component_id \
            INNER JOIN host h ON p.port_host = h.host_id \
            WHERE port_id = $1 \
            ORDER BY port_id ASC',
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
    console.log(`New POST request from ${req.ip} on endpoint /ports`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const {
            port_name,
            port_mode,
            port_host,
            port_component
        } = req.body;

        const maxPort_id = await db.query("SELECT MAX(port_id) FROM port");

        await db.query({
            text: `INSERT INTO port (
                port_id,
                port_name,
                port_mode,
                port_host,
                port_component
            ) VALUES ($1, $2, $3, $4, $5);`,
            values: [
                maxPort_id.rows[0].max + 1,
                port_name,
                port_mode,
                port_host,
                port_component
            ]
        });

        res.status(201).json({
            message: "Successfully created port",
            new_device_id: maxPort_id.rows[0].max + 1
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
    console.log(`New DELETE request from ${req.ip} on endpoint /ports`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const {
            id: id
        } = req.body;

        var count = await db.query("SELECT COUNT(*) FROM port WHERE port_id = " + id);

        if (count = 0) {
            res.status(404).json({
                message: "Port not found",
            })
        }

        await db.query({
            text: `DELETE FROM port WHERE port_id = ` + id,
        });

        res.status(200).json({
            message: "Successfully deleted port",
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
    console.log(`New PUT request from ${req.ip} on endpoint /ports`);
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

        var count = await db.query("SELECT COUNT(*) FROM port WHERE port_id = " + id);

        if (count = 0) {
            res.status(404).json({
                message: "Port not found",
            })
        }

        await db.query({
            text: `UPDATE port SET ` + items.join(", ") + ` WHERE port_id = ` + id
        });

        res.status(200).json({
            message: "Successfully updated port",
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
