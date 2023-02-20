const apiBaseLink = "http://localhost:4000/api";
const currentMenuStorage = document.getElementById("currentMenu");
var configComplete = {};
var pageConfig = {};
var localisation = {};
const language = "de";

function createTable(inputObj, headerNames, vars, withActions) {
    console.log("createTable called")
    const table = JSONtoHTMLtable(inputObj, headerNames, vars, withActions);
    document.getElementById("tablediv").innerHTML = "";
    const tableObj = document.getElementById("tablediv").appendChild(table);
    tableObj.className = "mainTable";
    tableObj.id = "mainTable";
}

function JSONtoHTMLtable(inputObj, headerNames, vars, withActions) {
    var uneven = true;

    const table = document.createElement("table");
    const thead = table.appendChild(document.createElement("thead"));
    const tbody = table.appendChild(document.createElement("tbody"));

    headerNames.forEach(element => {
        thead.appendChild(createNode("th", element))
    });
    if (withActions) {
        var column = createNode("th", localisation.actions);
        column.style.width = "10vw";
        thead.appendChild(column);
    };

    inputObj.rows.forEach(element => {
        const id = element[Object.keys(element).find(input => input.includes("id"))];
        const row = createNode("tr");
        vars.forEach(element2 => {
            row.appendChild(createNode("td", element[element2]))
        });
        if (withActions) {
            var actions = document.createElement("td");
            button = document.createElement("button");
            button.onclick = function () { openEditPopup(id) };
            button.innerText = localisation.edit;
            button.className = "actionButton";
            actions.appendChild(button);

            var button = document.createElement("button");
            button.onclick = function () { deleteEntry(id) };
            button.innerText = localisation.delete;
            button.className = "actionButton";
            actions.appendChild(button);
            row.appendChild(actions);
        };
        tbody.appendChild(row);
        if (uneven) {
            row.className = "tableUnevenRow";
        }
        else {
            row.className = "tableEvenRow";
        };
        uneven = !uneven;
    });
    return table
}

function refreshTable() {
    var config = pageConfig[parseInt(currentMenuStorage.innerText)];
    fetch(apiBaseLink + config.link)
        .then((response) => response.json())
        .then((data) => createTable(data, config.headers, config.varNames, true));
}

function createNode(type, content) {
    node = document.createElement(type);
    if (content != undefined) {
        node.appendChild(document.createTextNode(content))
    }
    return node
}

function setContent(input) {
    currentMenuStorage.innerText = input;
    console.log("setContent called with argument " + input);
    var config = pageConfig[input];
    fetch(apiBaseLink + config.link)
        .then((response) => response.json())
        .then((data) => createTable(data, config.headers, config.varNames, true));
    if (document.getElementById("optForm").innerHTML != "") {
        document.getElementById("optForm").innerHTML = "";
    }
    document.getElementById("optForm").appendChild(createSearchFormFromConfig(config.opt));
}

async function createEntry() {
    console.log("form submitted")
    var config = pageConfig[parseInt(currentMenuStorage.innerText)];
    var creationData = {};
    config.inputVars.forEach(element => {
        creationData[element] = document.getElementById(element).value;
    });
    await fetch(apiBaseLink + config.link, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(creationData)
    })
        .then(response => response.json())
        .then(response => console.log(JSON.stringify(response)));
    setContent(parseInt(currentMenuStorage.innerText));
}

function handleCreateSubmit(event) {
    event.preventDefault();
    createEntry(parseInt(currentMenuStorage.innerText));
    closePopUp();
}

function createFormFromConfig(input) {
    var form = document.createElement("form");
    form.onsubmit = function () { handleCreateSubmit(event) };
    input.forEach(element => {
        if (element.type == "selection") {
            var node = document.createElement("select");
            var options = 0;
            const attribs = Object.keys(element);
            for (let i = 0; i < attribs.length; i++) {
                const attribute = attribs[i];
                if (attribute == "type" || attribute == "path") { }
                else {
                    node.setAttribute(attribute, element[attribute])
                }
            }
            const res = fetch(apiBaseLink + element.path)
                .then(res => res = res.json())
                .then(res => res.rows)
                .then(res => res.forEach(row => {
                    const idKey = Object.keys(row).find(testString => {
                        if (testString.includes("_id")) {
                            return true;
                        }
                    });
                    const nameKey = Object.keys(row).find(testString => {
                        if (testString.includes("_name")) {
                            return true;
                        }
                    });
                    var option = document.createElement("option");
                    option.value = row[idKey];
                    option.innerText = row[nameKey];
                    node.appendChild(option);
                    options += 1;
                }));
        }
        else {

            var node = document.createElement("input");
            const attribs = Object.keys(element);
            for (let i = 0; i < attribs.length; i++) {
                const attribute = attribs[i];
                node.setAttribute(attribute, element[attribute])

            }
        }
        form.appendChild(node);
    });
    form.appendChild(createNode("br"));
    var submit = createNode("input");
    submit.type = "submit";
    submit.value = localisation.add;
    submit.className = "submit";
    submit.id = "submit";
    form.appendChild(submit)
    return form
}

async function init() {
    try {
        const req = await fetch(apiBaseLink + "/config", {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify()
        })
        const jsonObj = await req.json();
        console.log(jsonObj);
        configComplete = await jsonObj.config;
        pageConfig = await jsonObj.config.pages;
        localisation = await jsonObj.config.localisation[language];
        createButtons();
        createPopUp();

        document.getElementById("createButton").onclick = function (event) {
            creationPopup()
        };
        document.getElementById("refreshButton").onclick = function (event) {
            refreshTable()
        };

        setContent(0);

    } catch (err) {
        console.error(err);
    }
}

function createButtons() {
    for (let i = 0; i < pageConfig.length; i++) {
        const element = pageConfig[i];
        console.log(element.buttonName);
        const button = createNode("button");
        button.className = "sidebarButton";
        button.onclick = function (event) {
            setSelected(event);
            setContent(i)
        };
        var div = createNode("div");
        div.className = "buttondiv";
        button.appendChild(div);
        var img = createNode("span");
        img.className = "buttonMDI mdi mdi-" + element.buttonImage;
        div.appendChild(img);
        var span = createNode("span", element.buttonName);
        span.className = "buttonText";
        div.appendChild(span);
        document.getElementById("sidebar").appendChild(button);
        if (i == 0) {
            button.classList.add("selected");
        }
    }

    document.getElementById("sidebar").appendChild(document.getElementById("subnet"));
    document.getElementById("subnet").onclick = function (event) {
        setSelected(event);
        setSubnetCalc();
    }
    document.getElementById("sidebarSwitch").onclick = function () {
        closeSidebar();
    }
    document.getElementById("sidebar").appendChild(document.getElementById("sidebarSwitch"));
}

async function deleteEntry(id) {
    try {
        if (confirm(localisation.deleteConfirm)) {
            const config = await pageConfig[parseInt(currentMenuStorage.innerText)];
            const req = await fetch(apiBaseLink + config.link, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "id": id
                })
            })
                .then(response => response.json())
                .then(response => console.log(JSON.stringify(response)));
            setContent(parseInt(currentMenuStorage.innerText));

        } else {
            console.log("Cancelled");
        }
    } catch (err) {
        console.error(err);
    }
}

function setSubnetCalc() {
    config = [
        {
            "type": "text",
            "id": "ip_address",
            "name": "ip_address",
            "placeholder": "IP-Adresse",
            "required": true,
            "pattern": "^(?:(?:2[0-5][0-5]|[01][0-9][0-9]|[0-9][0-9]|[0-9])\.){3}(?:2[0-5][0-5]|[01][0-9][0-9]|[0-9][0-9]|[0-9])$"
        },
        {
            "type": "text",
            "id": "subnet_mask",
            "name": "subnet_mask",
            "placeholder": "Subnetzmaske",
            "required": true,
            "pattern": "^(?:(?:2[0-5][0-5]|[01][0-9][0-9]|[0-9][0-9]|[0-9])\.){3}(?:2[0-5][0-5]|[01][0-9][0-9]|[0-9][0-9]|[0-9])$"
        },
        {
            "type": "number",
            "id": "subnet_count",
            "name": "subnet_count",
            "placeholder": "Anzahl der Subnetze",
            "required": true
        }
    ]

    if (document.getElementById("optForm").innerHTML != "") {
        document.getElementById("optForm").innerHTML = "";
    }
    var form = createFormFromConfig(config);
    form.onsubmit = function () { handleSubmitSubnet(event) };
    document.getElementById("optForm").appendChild(form);

    document.getElementById("tablediv").innerHTML = "";
    document.getElementById("submit").value = localisation.calculate;
}

function calculateSubnets(ip_address, subnet_mask, subnet_count) {
    var output = {
        rows: []
    };
    const subnetOctet = subnet_mask.split(".");
    var binOctets = [];
    subnetOctet.forEach(element => {
        var temp = parseInt(element).toString(2);
        while (temp.length < 8) {
            temp = "0" + temp;
        }
        binOctets.push(temp);
    });

    const openIPs = 4294967295 - parseInt(binOctets.join(""), 2) + 1;
    const subnet_IP_count = openIPs / subnet_count;

    for (let i = 0; i < subnet_count; i++) {
        var temp = {};
        var ipOctets = ip_address.split(".");
        var binIpOctets = [];
        ipOctets.forEach(element => {
            var temp = parseInt(element).toString(2);
            while (temp.length < 8) {
                temp = "0" + temp;
            }
            binIpOctets.push(temp);
        });
        var subnet_address = parseInt(binIpOctets.join(""), 2) + subnet_IP_count * (i);
        temp["subnet_address"] = ipFromDecimal(subnet_address);
        temp["ip_range"] = modifyIp(ipFromDecimal(parseInt(binIpOctets.join(""), 2) + subnet_IP_count * (i)), 1) + " - " + modifyIp(ipFromDecimal(parseInt(binIpOctets.join(""), 2) + subnet_IP_count * (i + 1)), -2);
        temp["ip_broadcast"] = modifyIp(ipFromDecimal(parseInt(binIpOctets.join(""), 2) + subnet_IP_count * (i + 1)), -1);
        temp["device_count"] = ipToDecimal(modifyIp(ipFromDecimal(parseInt(binIpOctets.join(""), 2) + subnet_IP_count * (i + 1)), -2)) - ipToDecimal(ipFromDecimal(parseInt(binIpOctets.join(""), 2) + subnet_IP_count * (i)));
        output.rows.push(temp);
        console.log(i + "/" + subnet_count);
    }

    return output
}

function ipFromDecimal(input) {
    let binary = input.toString(2);
    binary = "0".repeat(32 - binary.length) + binary;
    const octets = binary.match(/.{8}/g);
    return octets.map(binaryOctet => parseInt(binaryOctet, 2)).join(".");
}

function modifyIp(input, change) {
    const octets = input.split(".");
    let decimalValue = 0;
    octets.forEach((element, index) => {
        decimalValue += parseInt(element) << (24 - 8 * index);
    });
    decimalValue += change;
    const result = [];
    for (let i = 3; i >= 0; i--) {
        result[i] = decimalValue & 255;
        decimalValue >>= 8;
    }
    return result.join(".");
}

function ipToDecimal(input) {
    const octets = input.split(".");
    return octets.reduce((sum, octet) => (sum << 8) + parseInt(octet), 0);
}

function setSubnetTable(ip_address, subnet_mask, subnet_count) {
    const config = [
        {
            headers: ["Subnetzadresse", "Nutzbarer IP-Bereich", "Broadcast-Addresse", "Mögliche Geräte"],
            varNames: ["subnet_address", "ip_range", "ip_broadcast", "device_count"]
        }
    ];
    var res = calculateSubnets(ip_address, subnet_mask, subnet_count);
    createTable(res, config[0].headers, config[0].varNames, false);
}

function handleSubmitSubnet(event) {
    event.preventDefault();
    const ip_address = document.getElementById("ip_address").value;
    const subnet_mask = document.getElementById("subnet_mask").value;
    const subnet_count = document.getElementById("subnet_count").value;
    setSubnetTable(ip_address, subnet_mask, subnet_count);
}

async function editEntry(id) {
    var config = pageConfig[parseInt(currentMenuStorage.innerText)];
    var updateData = {
        id: id
    };

    config.inputVars.forEach(element => {
        var value = document.getElementById("popup_" + element).value
        if (value != "") {
            updateData[element] = value;
        }
    });

    console.log(updateData);

    await fetch(apiBaseLink + config.link, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
        .then(response => response.json())
        .then(response => console.log(JSON.stringify(response)));
    setContent(parseInt(currentMenuStorage.innerText));
}

function createPopUp() {
    var button = document.createElement("button");
    button.className = "popupButton";
    button.onclick = function () { closePopUp() };
    var popup = document.createElement("div");
    popup.className = "popupOpen";
    popup.id = "popup";
    var popupHeader = popup.appendChild(document.createElement("div"));
    popupHeader.className = "popupHeader";
    var text = popupHeader.appendChild(document.createElement("span"));
    text.innerText = localisation.editEntry + ":";
    text.id = "popupHeaderText";
    var close = popupHeader.appendChild(document.createElement("button"));
    close.classList.add("closeButton");
    close.onclick = function () { closePopUp() }
    var closeImg = close.appendChild(document.createElement("span"));
    closeImg.classList.add("mdi");
    closeImg.classList.add("mdi-close");
    closeImg.alt = "close";
    var popupOpt = popup.appendChild(document.createElement("div"));
    popupOpt.className = "popupOpt";
    popupOpt.id = "popupOpt";
    document.getElementsByClassName("main")[0].appendChild(button);
    document.getElementsByClassName("main")[0].appendChild(popup);

    closePopUp();
}

function openPopUp() {
    document.getElementById("popup").className = "popupOpen";
    document.getElementsByClassName("popupButton")[0].disabled = false;
}

function closePopUp() {
    document.getElementById("popup").className = "popupClosed";
    document.getElementsByClassName("popupButton")[0].disabled = true;
}

async function createEditFormFromConfig(input, id) {
    var config = pageConfig[parseInt(currentMenuStorage.innerText)];
    var form = document.createElement("form");
    form.onsubmit = function () { handleEditSubmit(event, id) };
    await fetch(apiBaseLink + config.link + "/" + id)
        .then(response => response.json())
        .then(response => response.rows[0])
        .then(responseRow =>
            input.forEach(element => {
                if (element.type == "selection") {
                    var node = document.createElement("select");
                    var options = 0;
                    const attribs = Object.keys(element);
                    for (let i = 0; i < attribs.length; i++) {
                        const attribute = attribs[i];
                        if (attribute == "id") {
                            node.setAttribute(attribute, "popup_" + element[attribute])
                        }
                        else if (attribute == "type" || attribute == "path") { }
                        else {
                            node.setAttribute(attribute, element[attribute])
                        }
                    }
                    const res = fetch(apiBaseLink + element.path)
                        .then(res => res.json())
                        .then(res => res.rows)
                        .then(res => res.forEach(row => {
                            const idKey = Object.keys(row).find(testString => {
                                if (testString.includes("_id")) {
                                    return true;
                                }
                            });
                            const nameKey = Object.keys(row).find(testString => {
                                if (testString.includes("_name")) {
                                    return true;
                                }
                            });
                            var option = document.createElement("option");
                            option.value = row[idKey];
                            option.innerText = row[nameKey];
                            if (row[nameKey] == responseRow[nameKey]) {
                                option.selected = true;
                            }
                            node.appendChild(option);
                            options += 1;
                        }));
                    var label = document.createElement("label");
                    label.setAttribute("for", element.id);
                    label.innerText = element.placeholder;

                    form.appendChild(label);
                    form.appendChild(node);
                    form.appendChild(createNode("br"));
                }
                else {
                    var node = document.createElement("input");
                    const attribs = Object.keys(element);
                    for (let i = 0; i < attribs.length; i++) {
                        const attribute = attribs[i];
                        if (attribute == "id") {
                            node.setAttribute(attribute, "popup_" + element[attribute])
                        }
                        else if (attribute == "required") {
                        }
                        else {
                            node.setAttribute(attribute, element[attribute])
                        }
                        node.setAttribute("value", responseRow[element.name])
                    }
                    var label = document.createElement("label");
                    label.setAttribute("for", element.id);
                    label.innerText = element.placeholder;

                    form.appendChild(label);
                    form.appendChild(node);
                    form.appendChild(createNode("br"));
                }
            }))

    var submit = createNode("input");
    submit.type = "submit";
    submit.value = localisation.update;
    submit.className = "submit";
    submit.id = "editSubmit";
    form.appendChild(submit);
    return form
}

function handleEditSubmit(event, id) {
    event.preventDefault();
    editEntry(id);
    closePopUp();
}

async function openEditPopup(id) {
    var config = pageConfig[parseInt(currentMenuStorage.innerText)];
    document.getElementById("popupOpt").innerHTML = "";
    document.getElementById("popupOpt").appendChild(await createEditFormFromConfig(config.opt, id));
    document.getElementById("popupHeaderText").innerText = localisation.editEntry + ":";
    openPopUp();
}

async function setLocalisation(locCode) {
    try {
        const req = await fetch(apiBaseLink + "/config", {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify()
        })
        const jsonObj = await req.json();
        localisation = await jsonObj.config.localisation[locCode];
        setContent(parseInt(currentMenuStorage.innerText));
    } catch (error) {
        console.error(error);
    }
}

async function closeSidebar() {
    document.getElementById("content").classList.add("contentClosed");
    // document.getElementById("sidebarSwitch").style = "width: 3%"


    const text = Array.from(document.getElementsByClassName("buttonText"));
    for (let i = 0; i < text.length; i++) {
        const element = text[i];
        element.classList.add("hidden");
    };

    const buttons = Array.from(document.getElementsByClassName("buttonMDI"));
    for (let i = 0; i < buttons.length; i++) {
        const element = buttons[i];
        element.classList.replace("buttonMDI", "buttonMDIclosed");
    };

    document.getElementById("sidebar").className = "sidebarClosed";
    document.getElementById("sidebarSwitch").onclick = function () { openSidebar() }
}

async function openSidebar() {
    document.getElementById("content").classList.remove("contentClosed");
    // document.getElementById("sidebarSwitch").style = ""

    const text = Array.from(document.getElementsByClassName("buttonText"));
    for (let i = 0; i < text.length; i++) {
        const element = text[i];
        element.classList.remove("hidden");
    };

    const buttons = Array.from(document.getElementsByClassName("buttonMDIclosed"));
    for (let i = 0; i < buttons.length; i++) {
        const element = buttons[i];
        element.classList.replace("buttonMDIclosed", "buttonMDI");
    };

    document.getElementById("sidebar").className = "sidebarOpen";
    document.getElementById("sidebarSwitch").onclick = function () { closeSidebar() }
}

function setSelected(event) {
    const selected = Array.from(document.getElementsByClassName("selected"));
    if (selected.length > 0) {
        selected[0].classList.remove("selected");
    }
    event.target.classList.add("selected");
}

async function creationPopup() {
    var config = pageConfig[parseInt(currentMenuStorage.innerText)];
    document.getElementById("popupOpt").innerHTML = "";
    document.getElementById("popupOpt").appendChild(await createFormFromConfig(config.opt));
    document.getElementById("popupHeaderText").innerText = localisation.addEntry + ":";
    openPopUp();
}

function createSearchFormFromConfig(config) {
    var form = document.createElement("form");
    form.onsubmit = function () { handleSearchSubmit(event) };
    config.forEach(element => {
        if (element.type == "selection") {
            var node = document.createElement("select");
            const attribs = Object.keys(element);
            for (let i = 0; i < attribs.length; i++) {
                const attribute = attribs[i];
                if (attribute == "type" || attribute == "path") { }
                else {
                    node.setAttribute(attribute, element[attribute])
                }
            }

            var noSelect = document.createElement("option");
            noSelect.value = NaN;
            noSelect.innerText = "-";
            node.appendChild(noSelect);

            const res = fetch(apiBaseLink + element.path)
                .then(res => res = res.json())
                .then(res => res.rows)
                .then(res => res.forEach(row => {
                    const idKey = Object.keys(row).find(testString => {
                        if (testString.includes("_id")) {
                            return true;
                        } params
                    });
                    const nameKey = Object.keys(row).find(testString => {
                        if (testString.includes("_name")) {
                            return true;
                        }
                    });
                    var option = document.createElement("option");
                    option.value = row[idKey];
                    option.innerText = row[nameKey];
                    node.appendChild(option);
                }));
        }
        else {

            var node = document.createElement("input");
            const attribs = Object.keys(element);
            for (let i = 0; i < attribs.length; i++) {
                const attribute = attribs[i];
                if(attribute != "required") {
                    node.setAttribute(attribute, element[attribute])
                }
            }
        }
        form.appendChild(node);
    });
    form.appendChild(createNode("br"));
    var submit = createNode("input");
    submit.type = "submit";
    submit.value = localisation.search;
    submit.className = "submit";
    submit.id = "submit";
    form.appendChild(submit)
    return form
}

function handleSearchSubmit(event) {
    event.preventDefault();
    searchEntry(parseInt(currentMenuStorage.innerText));
    closePopUp();
}

async function searchEntry() {
    console.log("form submitted")
    var config = pageConfig[parseInt(currentMenuStorage.innerText)];
    var searchData = {};
    config.inputVars.forEach(element => {
        searchData[element] = encodeURI(document.getElementById(element).value);
    });

    var url = apiBaseLink + config.link + "/search?" + new URLSearchParams(searchData);
    console.log(url);
    await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    })
        .then(response => response.json())
        .then(response => createTable(response, config.headers, config.varNames, true))
        .then(response => console.log(JSON.stringify(response)));
}