const express = require('express');
const router = express.Router();
const pg = require('pg')

router.get("/", async (req, res) => {
    console.log(`New GET request from ${req.ip} on endpoint /hosts`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const { rows } = await db.query({
            text: 'SELECT h.*, l.location_name, t.component_type_name, v.vlan_name FROM host h \
            INNER JOIN location l ON h.host_location = l.location_id \
            INNER JOIN component_type t ON h.host_type = t.component_type_id \
            INNER JOIN vlan v ON h. host_vlan = v.vlan_id \
            ORDER BY host_id ASC'
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

        var queryString = "SELECT h.*, l.location_name, t.component_type_name, v.vlan_name FROM host h \
        INNER JOIN location l ON h.host_location = l.location_id \
        INNER JOIN component_type t ON h.host_type = t.component_type_id \
        INNER JOIN vlan v ON h. host_vlan = v.vlan_id "

        if (queryStrings.length > 0) {
            queryString = [queryString, "WHERE", queryStrings.join(" AND ")].join(" ");
        }
        queryString = queryString + " ORDER BY host_id ASC";

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
    console.log(`New GET request with id ${req.params.id} from ${req.ip} on endpoint /hosts`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const { rows } = await db.query({
            text: 'SELECT h.*, l.location_name, t.component_type_name, v.vlan_name FROM host h \
            INNER JOIN location l ON h.host_location = l.location_id \
            INNER JOIN component_type t ON h.host_type = t.component_type_id \
            INNER JOIN vlan v ON h. host_vlan = v.vlan_id \
            WHERE host_id = $1 \
            ORDER BY host_id ASC',
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
        console.log("Response sent.");
        db.end();
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

router.post("/", async (req, res) => {
    console.log(`New POST request from ${req.ip} on endpoint /hosts`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();

        const {
            host_ip,
            host_name,
            host_type,
            host_mac,
            host_vlan,
            host_location
        } = req.body;

        const existingHost = await db.query({
            text: "SELECT * FROM host WHERE host_name = $1",
            values: [host_name]
        });

        if (existingHost.rows.length > 0) return res.status(500).json({
            error: "Host already exists",
        })

        const maxHost_id = await db.query("SELECT MAX(host_id) FROM host;");

        await db.query({
            text: `INSERT INTO host (
                host_id,
                host_ip,
                host_name,
                host_type,
                host_mac,
                host_vlan,
                host_location
            ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
            values: [
                maxHost_id.rows[0].max + 1,
                host_ip,
                host_name,
                host_type,
                host_mac,
                host_vlan,
                host_location
            ]
        });

        res.status(201).json({
            message: "Successfully created host",
            new_host_id: maxHost_id.rows[0].max + 1
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
    console.log(`New DELETE request from ${req.ip} on endpoint /hosts`);
    try {
        const db = new pg.Client(process.env.dbToken);
        db.connect();
        const {
            id: id
        } = req.body;

        var count = await db.query("SELECT COUNT(*) FROM host WHERE host_id = " + id);

        if (count = 0) {
            res.status(404).json({
                message: "Host not found",
            })
        }

        await db.query({
            text: `DELETE FROM host WHERE host_id = ` + id,
        });

        res.status(200).json({
            message: "Successfully deleted host",
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
    console.log(`New PUT request from ${req.ip} on endpoint /hosts`);
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

        var count = await db.query("SELECT COUNT(*) FROM host WHERE host_id = " + id);

        if (count = 0) {
            res.status(404).json({
                message: "Location not found",
            })
        }

        await db.query({
            text: `UPDATE host SET ` + items.join(", ") + ` WHERE host_id = ` + id
        });

        res.status(200).json({
            message: "Successfully updated host",
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