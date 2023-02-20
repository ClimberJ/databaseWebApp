const express = require('express');
const router = express.Router();
const pg = require('pg')

router.get("/", async (req, res) => {
    console.log(`New GET request from ${req.ip} on endpoint /vlans`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const { rows } = await db.query({
            text: 'SELECT * FROM vlan \
            ORDER BY vlan_id ASC'
        });
        await res.status(200).json({
            rows,
        });
        console.log("Response sent.");
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

        var queryString = "SELECT * FROM vlan "

        if (queryStrings.length > 0) {
            queryString = [queryString, "WHERE", queryStrings.join(" AND ")].join(" ");
        }
        queryString = queryString + " ORDER BY vlan_id ASC";

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
    console.log(`New GET request with id ${req.params.id} from ${req.ip} on endpoint /vlans`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const { rows } = await db.query({
            text: 'SELECT * FROM vlan \
            WHERE vlan_id = $1 \
            ORDER BY vlan_id ASC',
            values: [
                req.params.id
            ]
        });
        await res.status(200).json({
            rows,
        });
        console.log("Response sent.");
        db.end();
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.post("/", async (req, res) => {
    console.log(`New POST request from ${req.ip} on endpoint /vlans`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();

        console.log(req.body);

        const {
            vlan_number,
            vlan_name
        } = req.body;

        const existingVlan = await db.query({
            text: "SELECT * FROM vlan WHERE vlan_name = $1",
            values: [vlan_name]
        });

        if (existingVlan.rows.length > 0) return res.status(500).json({
            error: "VLAN already exists",
        })

        const maxVlan_id = await db.query("SELECT MAX(vlan_id) FROM vlan;");

        await db.query({
            text: `INSERT INTO vlan (
                vlan_id,
                vlan_name,
                vlan_number
            ) VALUES ($1, $2, $3);`,
            values: [
                maxVlan_id.rows[0].max + 1,
                vlan_name,
                vlan_number
            ]
        });

        res.status(201).json({
            message: "Successfully created vlan",
            new_vlan_id: maxVlan_id.rows[0].max + 1
        })
        console.log("Response sent");
        db.end();

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        });
    }
});

router.delete("/", async (req, res) => {
    console.log(`New DELETE request from ${req.ip} on endpoint /vlans`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const {
            id: id
        } = req.body;

        var count = await db.query("SELECT COUNT(*) FROM vlan WHERE vlan_id = " + id);

        if (count = 0) {
            res.status(404).json({
                message: "Vlan not found",
            })
        }

        await db.query({
            text: `DELETE FROM vlan WHERE vlan_id = ` + id,
        });

        res.status(200).json({
            message: "Successfully deleted vlan",
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
    console.log(`New PUT request from ${req.ip} on endpoint /vlans`);
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

        var count = await db.query("SELECT COUNT(*) FROM vlan WHERE vlan_id = " + id);

        if (count = 0) {
            res.status(404).json({
                message: "Vlan not found",
            })
        }

        await db.query({
            text: `UPDATE vlan SET ` + items.join(", ") + ` WHERE vlan_id = ` + id
        });

        res.status(200).json({
            message: "Successfully updated vlan",
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
