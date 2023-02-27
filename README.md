# Database Web App
## Overview
This highly configurable interface allows for editing, creating and deleting entries in one or more databases. The configuration is managed via a JSON file.
## Technical Stuff
### Functions
| Function | Description |
| --- | --- |
| `createTable()` | Creates an HTML table based on the input object and adds it to the HTML document. |
| `JSONtoHTMLtable()` | Converts a JSON object to an HTML table. |
| `refreshTable()` | Refreshes the table based on the current menu selection. |
| `createNode()` | Creates an HTML element of the specified type with the given content. |
| `setContent()` | Changes the current menu and fetches data from the associated API endpoint to display in a table. Also generates an options form based on the API endpoint's configuration. |
| `createEntry()` | Handles a form submission to create an entry. |
| `handleCreateSubmit()` | Handles the form submission for creating a new entry. |
| `createFormFromConfig()` | Creates a form element from an input config. |
| `init()` | Initializes the application by fetching the configuration data from the API, setting up the user interface, and displaying the initial content. |
| `createButtons()` | Creates the sidebar buttons and adds them to the page. |
| `deleteEntry()` | Deletes an entry with a given ID from the API and refreshes the table. |
| `editEntry()` | Edits an entry with a given ID in the API and refreshes the table. |
| `createPopUp()` | Creates the pop-up for editing or creating an entry. |
| `openPopUp()` | Opens the pop-up for editing or creating an entry. |
| `closePopUp()` | Closes the pop-up for editing or creating an entry. |
| `createEditFormFromConfig()` | This function handles the submission of an edit form and updates the corresponding entry in the database. |
| `handleEditSubmit()` | Handles the submission of an edit form. |
| `openEditPopup()` | Opens a popup for editing an entry. |
| `setLocalisation()` | Sets the current language for the application and updates the UI to reflect the new language. |
| `closeSidebar()` | Closes the sidebar by updating the classes and onclick handler of elements. |
| `openSidebar()` | Opens the sidebar by updating the classes and onclick handler of elements. |
| `setSelected()` | Sets the "selected" class to the clicked element and removes it from previously selected elements. |
| `creationPopup()` | Opens a popup with a form for creating a new entry using the configuration for the current page's menu option. |
| `createSearchFormFromConfig()` | Creates a search form based on the provided configuration object. |
| `handleSearchSubmit(event)` | Handles the submission of an search form. |
| `searchEntry()` | Handles the submission of a search form by extracting the input data, creating the search query URL, and calling the relevant API. |
