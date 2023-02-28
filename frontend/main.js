const apiBaseLink = "http://localhost:4000/api";
const currentMenuStorage = document.getElementById("currentMenu");
var configComplete = {};
var pageConfig = {};
var localisation = {};
const language = "de-DE";

/**
 * Comments were generated using ChatGPT.
 */

/**
 * Creates an HTML table based on the input object and adds it to the HTML document.
 *
 * @param {object} inputObj - The input object to create a table from.
 * @param {Array<string>} headerNames - An array of header names for the table.
 * @param {Array<string>} vars - An array of variables to be displayed in each row of the table.
 * @param {boolean} withActions - A flag to determine whether or not to include an actions column.
 */
function createTable(inputObj, headerNames, vars, withActions) {
	// Log that the function was called
	console.log("createTable called")
	// Convert input object to HTML table
	const table = JSONtoHTMLtable(inputObj, headerNames, vars, withActions);
	// Clear existing table content
	document.getElementById("tablediv").innerHTML = "";
	// Append new table to HTML document and set class and ID
	const tableObj = document.getElementById("tablediv").appendChild(table);
	tableObj.className = "mainTable";
	tableObj.id = "mainTable";
}

/**
 * Converts a JSON object to an HTML table.
 *
 * @param {object} inputObj - The JSON object to convert to a table.
 * @param {Array<string>} headerNames - An array of header names for the table.
 * @param {Array<string>} vars - An array of variables to be displayed in each row of the table.
 * @param {boolean} withActions - A flag to determine whether or not to include an actions column.
 * @returns {HTMLTableElement} The resulting HTML table.
 */
function JSONtoHTMLtable(inputObj, headerNames, vars, withActions) {

	// Set uneven flag for table row styling
	var uneven = true;

	// Create table, header, and body elements
	const table = document.createElement("table");
	const thead = table.appendChild(document.createElement("thead"));
	const tbody = table.appendChild(document.createElement("tbody"));

	// Add header columns to table
	headerNames.forEach(element => {
		thead.appendChild(createNode("th", element))
	});

	// If withActions is true, add an "actions" column to header
	if (withActions) {
		var column = createNode("th", localisation.actions);
		column.style.width = "10vw";
		thead.appendChild(column);
	};

	// Add data rows to table
	inputObj.rows.forEach(element => {
		const id = element[Object.keys(element).find(input => input.includes("id"))];
		const row = createNode("tr");

		// Add data cells to row based on vars array
		vars.forEach(element2 => {
			row.appendChild(createNode("td", element[element2]))
		});

		// If withActions is true, add edit and delete buttons to row
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

		// Add row to table body and set row class for uneven styling
		tbody.appendChild(row);
		if (uneven) {
			row.className = "tableUnevenRow";
		}
		else {
			row.className = "tableEvenRow";
		};
		uneven = !uneven;
	});

	// Return the final table
	return table
}

/**
 * Refreshes the table based on the current menu selection. Retrieves data from the API
 * and creates a new table in the HTML document using the data.
 */
function refreshTable() {
	var config = pageConfig[parseInt(currentMenuStorage.innerText)];
	fetch(apiBaseLink + config.link)
		.then((response) => response.json())
		.then((data) => createTable(data, config.headers, config.varNames, true));
}

/**
 * Creates an HTML element of the specified type with the given content.
 * 
 * @param {string} type - The type of the HTML element to create.
 * @param {string} [content] - The content to add to the HTML element (optional).
 * 
 * @returns {HTMLElement} - The created HTML element.
 */
function createNode(type, content) {
	node = document.createElement(type);
	if (content != undefined) {
		node.appendChild(document.createTextNode(content))
	}
	return node
}

/**
 * Changes the current menu and fetches data from the associated API endpoint to display in a table.
 * Also generates an options form based on the API endpoint's configuration.
 * 
 * @param {number} input - The name of the menu item to set as the current menu.
 * 
 * @returns {void}
 */
function setContent(input) {
	currentMenuStorage.innerText = input;
	console.log("setContent called with argument " + input);
	var config = pageConfig[input];
	fetch(apiBaseLink + config.link)
		.then((response) => response.json())
		.then((data) => createTable(data, config.headers, config.varNames, true));

	// Clears the options form and adds a new one based on config data
	if (document.getElementById("optForm").innerHTML != "") {
		document.getElementById("optForm").innerHTML = "";
	}
	document.getElementById("optForm").appendChild(createSearchFormFromConfig(config.opt));
}

/**
 * Handles a form submission to create an entry.
 *
 * @async
 * @returns {void}
 */
async function createEntry() {
	console.log("form submitted")
	var config = pageConfig[parseInt(currentMenuStorage.innerText)];

	// Collect input data from the form and store it in an object
	var creationData = {};
	config.inputVars.forEach(element => {
		creationData[element] = document.getElementById("popup_" + element).value;
	});

	// Send a POST request to the API with the input data
	await fetch(apiBaseLink + config.link, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(creationData)
	})
		// Log the response to the console
		.then(response => response.json())
		.then(response => console.log(JSON.stringify(response)));

	// Refresh the table on the current page
	setContent(parseInt(currentMenuStorage.innerText));
}

/**
 * Handles the form submission for creating a new entry.
 *
 * @param {Event} event - The form submission event.
 * @returns {void}
 */
function handleCreateSubmit(event) {
	// Prevent the default form submission behavior
	event.preventDefault();

	// Call the createEntry function and close the popup
	createEntry(parseInt(currentMenuStorage.innerText));
	closePopUp();
}

/**
 * Creates a form element from an input config.
 *
 * @param {object[]} input - An array of objects that define the form fields.
 * @returns {HTMLElement} - A form element created from the input config.
 */
function createFormFromConfig(input) {
	// Create a new HTML form
	var form = document.createElement("form");
	// Set the form's onsubmit function to handleCreateSubmit
	form.onsubmit = function () { handleCreateSubmit(event) };
	// Loop through each input object in the configuration array
	input.forEach(element => {
		// If the input type is a "selection" element
		if (element.type == "selection") {
			// Create a new HTML select element
			var node = document.createElement("select");
			// Set the attributes of the select element
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
			// Fetch the data for the selection options from the API
			const res = fetch(apiBaseLink + element.path)
				.then(res => res = res.json())
				.then(res => res.rows)
				// For each row in the result set, create an option element and add it to the select element
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
				}));
		}
		// Otherwise, create a new HTML input element
		else {
			var node = document.createElement("input");
			// Set the attributes of the input element
			const attribs = Object.keys(element);
			for (let i = 0; i < attribs.length; i++) {
				const attribute = attribs[i];
				if (attribute == "id") {
					node.setAttribute(attribute, "popup_" + element[attribute])
				}
				else {
					node.setAttribute(attribute, element[attribute])
				}
			}
		}
		// Add the input element to the form
		form.appendChild(node);
	});
	// Add a line break to the form
	form.appendChild(createNode("br"));
	// Create a new submit input element and add it to the form
	var submit = createNode("input");
	submit.type = "submit";
	submit.value = localisation.add;
	submit.className = "submit";
	submit.id = "submit";
	form.appendChild(submit)
	// Return the completed form
	return form
}

/**
 * Initializes the application by fetching the configuration data from the API,
 * setting up the user interface, and displaying the initial content.
 * @async
 */
async function init() {
	try {
		// Send a GET request to retrieve the configuration data from the API
		const req = await fetch(apiBaseLink + "/config", {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify()
		})

		// Convert the response to JSON format and store it in the jsonObj variable
		const jsonObj = await req.json();

		// Store the configuration data and page configurations in global variables
		configComplete = await jsonObj.config;
		pageConfig = await jsonObj.config.pages;

		// Store the localized strings in a global variable
		localisation = await jsonObj.config.localisation[language];

		// Call functions to create the UI buttons and pop-up window
		createButtons();
		createPopUp();

		// Set event listeners for the "Create" and "Refresh" buttons
		document.getElementById("createButton").onclick = function (event) {
			creationPopup()
		};
		document.getElementById("refreshButton").onclick = function (event) {
			refreshTable()
		};

		// Load the default page content (index 0) by calling the setContent function
		setContent(0);

	} catch (err) {
		console.error(err);
	}
}

/**
 * Creates the sidebar buttons and adds them to the page.
 *
 * @returns {void}
 */
function createButtons() {
	// Iterate over pageConfig to create buttons for each element
	for (let i = 0; i < pageConfig.length; i++) {
		// Retrieve current page config element
		const element = pageConfig[i];

		// Create a new button element and set its attributes
		const button = createNode("button");
		button.className = "sidebarButton";
		button.onclick = function (event) {
			setSelected(event);
			setContent(i)
		};

		// Create a div to hold the icon and label elements
		var div = createNode("div");
		div.className = "buttondiv";
		button.appendChild(div);

		// Create a span element to hold the icon and set its class
		var img = createNode("span");
		img.className = "buttonMDI mdi mdi-" + element.buttonImage;
		div.appendChild(img);

		// Create a span element to hold the label and set its class and text content
		var span = createNode("span", element.buttonName);
		span.className = "buttonText";
		div.appendChild(span);

		// Append the button to the sidebar element
		document.getElementById("sidebar").appendChild(button);

		// Add 'selected' class to the first button
		if (i == 0) {
			button.classList.add("selected");
		}
	}

	// Set onclick behavior for the sidebar switch element and append it to the sidebar
	document.getElementById("sidebarSwitch").onclick = function () {
		closeSidebar();
	}
	document.getElementById("sidebar").appendChild(document.getElementById("sidebarSwitch"));
}

/**
 * Deletes an entry with a given ID from the API and refreshes the table
 * @async
 * @param {number} id - ID of the entry to be deleted
 * @returns {Promise<void>}
 */
async function deleteEntry(id) {
	try {
		// Confirm whether the user wants to delete the entry.
		if (confirm(localisation.deleteConfirm)) {
			// Retrieve the configuration for the current page.
			const config = await pageConfig[parseInt(currentMenuStorage.innerText)];
			// Send a DELETE request to the API to delete the specified entry.
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
			// Update the content of the page to reflect the changes.
			setContent(parseInt(currentMenuStorage.innerText));

		} else {
			// If the user cancelled the deletion, log a message.
			console.log("Cancelled");
		}
	} catch (err) {
		// If an error occurred during the deletion process, log the error message.
		console.error(err);
	}
}

/**
 * Edits an entry with a given ID in the API and refreshes the table
 * @async
 * @param {number} id - ID of the entry to be edited
 * @returns {Promise<void>}
 */
async function editEntry(id) {
	// Retrieve the configuration for the current page.
	var config = pageConfig[parseInt(currentMenuStorage.innerText)];
	// Create an object to hold the updated data.
	var updateData = {
		id: id
	};

	// Loop through each input variable for the current page.
	config.inputVars.forEach(element => {
		// Retrieve the value of the input field.
		var value = document.getElementById("popup_" + element).value
		// If the value is not empty, add it to the updateData object.
		if (value != "") {
			updateData[element] = value;
		}
	});

	console.log(updateData);

	// Send a PATCH request to the API to update the specified entry.
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
	// Update the content of the page to reflect the changes.
	setContent(parseInt(currentMenuStorage.innerText));
}


/**
 * Creates the pop-up for editing or creating an entry.
 */
function createPopUp() {
	// Create a close button for the popup
	var button = document.createElement("button");
	button.className = "popupButton";
	button.onclick = function () { closePopUp() };

	// Create a div to hold the popup contents
	var popup = document.createElement("div");
	popup.className = "popupOpen";
	popup.id = "popup";

	// Create a header for the popup
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

	// Create a div to hold the options in the popup
	var popupOpt = popup.appendChild(document.createElement("div"));
	popupOpt.className = "popupOpt";
	popupOpt.id = "popupOpt";

	// Add the popup and close button to the page
	document.getElementsByClassName("main")[0].appendChild(button);
	document.getElementsByClassName("main")[0].appendChild(popup);

	// Hide the popup
	closePopUp();
}

/**
 * Opens the pop-up for editing or creating an entry.
 */
function openPopUp() {
	document.getElementById("popup").className = "popupOpen";
	document.getElementsByClassName("popupButton")[0].disabled = false;
}

/**
 * Closes the pop-up for editing or creating an entry.
 */
function closePopUp() {
	document.getElementById("popup").className = "popupClosed";
	document.getElementsByClassName("popupButton")[0].disabled = true;
}

/**
 * This function handles the submission of an edit form and updates
 * the corresponding entry in the database.
 * @async
 * @param {Array} input - An array of objects specifying the form elements to create.
 * @param {string} id - The ID of the record to edit.
 * @returns {Promise<HTMLFormElement>} - A promise that resolves to the generated edit form.
 */
async function createEditFormFromConfig(input, id) {
	var form;
	// Get the configuration for the current page from pageConfig and assign it to a variable named config.
	var config = pageConfig[parseInt(currentMenuStorage.innerText)];
	// Create a new form element and assign it to a variable named form. Assign a function to its onsubmit event listener.
	form.onsubmit = function () { handleEditSubmit(event, id) };
	// Make a GET request to the specified API endpoint using the API base link and config.link. Parse the response as JSON.
	// Retrieve the first row from the response and assign it to responseRow.
	await fetch(apiBaseLink + config.link + "/" + id)
		.then(response => response.json())
		.then(response => response.rows[0])
		.then(responseRow =>
			// Loop through each element in the input array.
			input.forEach(element => {
				// If the element type is "selection", create a new select element, loop through its attributes, 
				// and set them using the values from the element object. Then make a GET request to the specified API endpoint
				// using the element path, and create an option element for each row in the response.
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
				// If the element type is not "selection", create a new input element, loop through its attributes, 
				// and set them using the values from the element object. Set the input element's value to the value of the
				// corresponding property in responseRow.
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

/**
 * Handles the submission of an edit form.
 * 
 * @param {Event} event - The submit event.
 * @param {number} id - The ID of the entry being edited.
 */
function handleEditSubmit(event, id) {
	// Prevent the default behavior of the event
	event.preventDefault();
	// Call the editEntry function with the provided id
	editEntry(id);
	// Close the popup
	closePopUp();
}

/**
 * Opens a popup for editing an entry.
 * 
 * @param {number} id - The ID of the entry to edit.
 * @returns {Promise<void>} - A Promise that resolves when the popup is opened.
 */
async function openEditPopup(id) {
	// Get the configuration for the current page
	var config = pageConfig[parseInt(currentMenuStorage.innerText)];
	// Clear the current popup window and add the edit form from the configuration
	document.getElementById("popupOpt").innerHTML = "";
	document.getElementById("popupOpt").appendChild(await createEditFormFromConfig(config.opt, id));
	// Set the popup header text to indicate that this is an edit form
	document.getElementById("popupHeaderText").innerText = localisation.editEntry + ":";
	// Open the popup window
	openPopUp();
}

/**
 * Sets the current language for the application and updates the UI to reflect the new language.
 * 
 * @param {string} locCode - The language code to set (e.g. "en-US").
 * @returns {Promise<void>} - A Promise that resolves when the language is set and the UI is updated.
 */
async function setLocalisation(locCode) {
	try {
		// Sends a GET request to retrieve the configuration details from the API.
		const req = await fetch(apiBaseLink + "/config", {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify()
		});
		// Parses the JSON response from the API.
		const jsonObj = await req.json();
		// Extracts the localisation details for the specified language code.
		localisation = await jsonObj.config.localisation[locCode];
		// Calls the setContent function with the current menu index to update the UI.
		setContent(parseInt(currentMenuStorage.innerText));
	} catch (error) {
		// Logs any errors to the console.
		console.error(error);
	}
}

/**
 * Closes the sidebar by updating the classes and onclick handler of elements.
 */
async function closeSidebar() {
	// Add the "contentClosed" class to the content element
	document.getElementById("content").classList.add("contentClosed");

	const text = Array.from(document.getElementsByClassName("buttonText"));
	for (let i = 0; i < text.length; i++) {
		const element = text[i];
		// Add the "hidden" class to all elements with the "buttonText" class
		element.classList.add("hidden");
	};

	const buttons = Array.from(document.getElementsByClassName("buttonMDI"));
	for (let i = 0; i < buttons.length; i++) {
		const element = buttons[i];
		// Replace the "buttonMDI" class with "buttonMDIclosed" for all elements with the "buttonMDI" class
		element.classList.replace("buttonMDI", "buttonMDIclosed");
	};

	// Set the "className" property of the sidebar element to "sidebarClosed"
	document.getElementById("sidebar").className = "sidebarClosed";

	// Change the onclick function of the sidebarSwitch element to openSidebar()
	document.getElementById("sidebarSwitch").onclick = function () { openSidebar() }
}

/**
 * Opens the sidebar by updating the classes and onclick handler of elements.
 */
async function openSidebar() {
	// This code removes the class "contentClosed" from the element with the ID "content". This causes the content area to expand to fill the available space.
	document.getElementById("content").classList.remove("contentClosed");

	// This code removes the class "hidden" from all elements with the class "buttonText". This makes the text on all buttons visible again.
	const text = Array.from(document.getElementsByClassName("buttonText"));
	for (let i = 0; i < text.length; i++) {
		const element = text[i];
		element.classList.remove("hidden");
	};

	// This code replaces the class "buttonMDIclosed" with "buttonMDI" on all elements with the class "buttonMDIclosed". This makes the icons on all buttons visible again.
	const buttons = Array.from(document.getElementsByClassName("buttonMDIclosed"));
	for (let i = 0; i < buttons.length; i++) {
		const element = buttons[i];
		element.classList.replace("buttonMDIclosed", "buttonMDI");
	};

	// This code sets the class of the "sidebar" element to "sidebarOpen". This causes the sidebar to become visible again.
	document.getElementById("sidebar").className = "sidebarOpen";

	// This code sets the "onclick" event handler of the "sidebarSwitch" button to call the "closeSidebar" function. This changes the functionality of the button from "open the sidebar" to "close the sidebar".
	document.getElementById("sidebarSwitch").onclick = function () { closeSidebar() }
	document.getElementById("sidebarSwitch").onclick = function () { closeSidebar() }
}

/**
 * Sets the "selected" class to the clicked element and removes it from previously selected elements.
 * 
 * @param {Event} event - The event that triggered the function.
 */
function setSelected(event) {
	// get any already-selected element(s)
	const selected = Array.from(document.getElementsByClassName("selected"));
	// if there is at least one, remove "selected" class from it
	if (selected.length > 0) {
		selected[0].classList.remove("selected");
	}
	// add "selected" class to the clicked element
	event.target.classList.add("selected");
}

/**
 * Opens a popup with a form for creating a new entry using the configuration
 * for the current page's menu option.
 */
async function creationPopup() {
	// Get the page configuration for the currently selected menu option
	var config = pageConfig[parseInt(currentMenuStorage.innerText)];
	// Clear the popup form and append a new form created from the page configuration
	document.getElementById("popupOpt").innerHTML = "";
	document.getElementById("popupOpt").appendChild(await createFormFromConfig(config.opt));

	// Set the popup header text to the localized string for adding new entries
	document.getElementById("popupHeaderText").innerText = localisation.addEntry + ":";

	// Open the popup
	openPopUp();
}

/**
 * Creates a search form based on the provided configuration object.
 * @param {Array} config - An array of objects containing the properties to build the search form.
 * @return {HTMLElement} - The search form HTML element.
 */
function createSearchFormFromConfig(config) {
	// create the form element
	var form = document.createElement("form");
	// add an event listener for when the form is submitted
	form.onsubmit = function () { handleSearchSubmit(event) };

	// iterate over the configuration object and create form elements based on the type
	config.forEach(element => {
		if (element.type == "selection") {
			// create a dropdown element
			var node = document.createElement("select");

			// iterate over the attributes of the element object and set them as attributes of the dropdown
			const attribs = Object.keys(element);
			for (let i = 0; i < attribs.length; i++) {
				const attribute = attribs[i];
				if (attribute == "type" || attribute == "path") { }
				else {
					node.setAttribute(attribute, element[attribute])
				}
			}

			// add a "no selection" option to the dropdown
			var noSelect = document.createElement("option");
			noSelect.value = NaN;
			noSelect.innerText = "-";
			node.appendChild(noSelect);

			// fetch the values for the dropdown from the server
			const res = fetch(apiBaseLink + element.path)
				.then(res => res = res.json())
				.then(res => res.rows)
				.then(res => res.forEach(row => {
					// find the ID and name keys for the row object
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
					// create an option element and add it to the dropdown
					var option = document.createElement("option");
					option.value = row[idKey];
					option.innerText = row[nameKey];
					node.appendChild(option);
				}));
		}
		else {
			// create an input element of the specified type
			var node = document.createElement("input");
			const attribs = Object.keys(element);
			for (let i = 0; i < attribs.length; i++) {
				const attribute = attribs[i];
				if (attribute != "required") {
					node.setAttribute(attribute, element[attribute])
				}
			}
		}
		// append the form element to the form
		form.appendChild(node);
	});

	// append a line break and a submit button to the form
	form.appendChild(createNode("br"));
	console.log(form);
	var submit = createNode("input");
	submit.type = "submit";
	submit.value = localisation.search;
	submit.className = "submit";
	submit.id = "submit";
	form.appendChild(submit);

	// return the completed form
	return form
}

/**
 * Handles the submission of an search form.
 * 
 * @param {object[]} config - The configuration object that defines the form elements.
 * @returns {HTMLElement} The HTML form element created based on the configuration object.
 */
function handleSearchSubmit(event) {
	// prevent the form from submitting
	event.preventDefault();
	// call the searchEntry function with the current menu id
	searchEntry(parseInt(currentMenuStorage.innerText));
	// close the search popup
	closePopUp();
}

/**
 * Handles the submission of a search form by extracting the input data, creating the search query URL,
 * and calling the relevant API.
 * @async
 * @returns {Promise<void>} - A Promise that resolves when the API call has completed and the response
 * data has been processed.
 */
async function searchEntry() {
	console.log("form submitted")
	var config = pageConfig[parseInt(currentMenuStorage.innerText)];
	// Get the search configuration data from pageConfig using the currentMenuStorage value
	var searchData = {};
	// Define an empty object to hold the search data extracted from the form
	config.inputVars.forEach(element => {
		// Loop over each input variable specified in the search configuration
		searchData[element] = encodeURI(document.getElementById(element).value);
		// Add the encoded value of the form input with the current element ID to the searchData object
	});
	var url = apiBaseLink + config.link + "/search?" + new URLSearchParams(searchData);
	// Create the search URL by appending the search query string to the API base link and endpoint
	console.log(url);
	await fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded'
		},
	})
		.then(response => response.json())
		// Convert the response data to JSON format
		.then(response => createTable(response, config.headers, config.varNames, true))
		// Call the createTable function to format and display the search results
		.then(response => console.log(JSON.stringify(response)));
	// Log the response data as a JSON string to the console
}