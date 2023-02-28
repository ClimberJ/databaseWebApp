# Database Web App
## Overview
This highly configurable interface allows for editing, creating and deleting entries in one or more databases. The configuration is managed via a JSON file. Feel free to share how you use this project in [here](https://github.com/ClimberJ/databaseWebApp/discussions/categories/show-and-tell).
## Setup
1. Clone this repository
2. Configure the pages you want to show in the "pages" section of the [config file](/backend/config.json).
    - The "link" specifies the http endpoint under wich the data for this page can be accessed.
    - The "headers" specify what the columns in the table should be called.
    - The "varNames" specify what the columns are called in the database.
    - The "inputVars" specify the names of the input fields for editing/creating/deleting. (This will probably be changed.)
    - The "buttonName" specifies the text on the button in the sidebar.
    - The "buttonImage" specifies the icon in the button in the sidebar. The icon has to be a Material Design Icon, a list of which can be found [here](https://pictogrammers.com/library/mdi/).
    - "opt" specifies the attribues of the input fields for editing/creating/deleting. If the type is set to selection, the input will be a dropdown. In this case you have to define a path to the endpoit fom wich o gt the options. The frontend will make a GET request to that endpoint and take the column with "_name" as the name of the option and the column with "_id" as the option value. In every other case, the variable name should be the exact name of the attribute you want to set and theariable should be the attributes value.
3. Set the logo, icon and page title in the HTML.
   
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
