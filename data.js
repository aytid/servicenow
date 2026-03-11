const articlesData = [
    {
        id: '1001',
        title: 'Custom Quick Link Widget',
        category: 'Tutorial',
        excerpt: 'Built a custom ServiceNow Quick Link widget that transforms standard links into vibrant, center-aligned interactive cards.',
        tags: ['Custom Widget', 'Quick Links', 'Employee Center'],
        date: '2025-06-28',
        views: 920,
        created: '2025-06-28T11:00:00Z',
        content: `

**Author: Rohan Aditya**

### Key Points Covered
- Creating custom widgets in ServiceNow  
- Adding quick navigation features  
- Transforming ordinary links into vibrant, center-aligned cards  

Here’s how I built a custom ServiceNow widget that transforms ordinary links into vibrant, center-aligned cards.  
Stylish? Absolutely.  
Overengineered? Maybe.

---

## Steps to Create this Custom Quick Link Widget

1. From the **All** menu, navigate to **Service Portal > Widgets**.  
2. In the widget list, search for **"Quick Links"** and open its record.  
3. Click the **Clone** button in the top-right corner. This creates **"Copy of Quick Links"**.  
4. Update the cloned widget’s **Name**, **ID**, and **Description**.  
5. Update the following sections:
   - HTML Template  
   - CSS  
   - Server Script  
   - Client Script  
6. Alternatively, import the pre-configured XML file to apply the layout instantly.

⬇ Download Widget XML

---

## HTML Template

\`\`\`html
<!-- Quick Link Card -->
<div class="all-card-container">
  <a class="quick-links card"
     aria-labelledby="{{data.instanceId}}-quick-link"
     id="{{data.instanceId}}-quick-link"
     ng-href="{{data.json_data[0].url}}"
     ng-click="clicked(data.json_data[0])"
     ng-attr-target="{{data.json_data[0].target}}"
     tabindex="0">

    <div class="circle">
      <div class="icon" 
           ng-if="data.json_data[0].icon && data.json_data[0].icon.length"
           style="background-image: url({{data.json_data[0].icon}});"></div>
    </div>

    <div class="overlay"></div>

    <p class="card-title">{{data.title}}</p>
    <p class="card-description">{{data.short_description}}</p>

  </a>
</div>
\`\`\`

---

## CSS Styling

\`\`\`css
.quick-links {
  --bg-color: #DCE9FF;
  --bg-color-light: #f1f7ff;
  --text-color-hover: #4C5656;
  --box-shadow-color: rgba(220, 233, 255, 0.48);
}

.all-card-container {
  display: flex;
  justify-content: center;
  width: 260px;
  margin: auto;
  margin-top: -8rem;
}

.quick-links.card {
  width: 250px;
  height: 321px;
  background: #fff;
  border: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  transition: all 0.3s ease-out;
  text-decoration: none;
  border-radius: 5px;
}

.quick-links.card:hover {
  transform: translateY(-25px) scale(1.005) translateZ(0);
  box-shadow: 0 24px 36px rgba(0,0,0,0.11),
              0 24px 46px var(--box-shadow-color);
}
\`\`\`

---

## Server Script

\`\`\`javascript
(function () {
    data.instanceId = $sp.getDisplayValue("sys_id");
    var quickLinkId = $sp.getParameter("quick_link_id");
    var pageId = $sp.getParameter("id");

    var quickLinkUtil = new sn_ex_sp.QuickLinkUtil();

    data.title = (options && options.title) ? options.title : "";
    data.short_description = (options && options.short_description) ? options.short_description : "";
    var selectedQuickLink = (options && options.select_a_quick_link) ? options.select_a_quick_link : "";

    if (quickLinkId && pageId === "quick_link_preview") {
        data.json_data = quickLinkUtil.fetchQuicklinksForHomePage(quickLinkId, data.instanceId);
    } else if (selectedQuickLink) {
        data.json_data = quickLinkUtil.fetchQuicklinksForHomePage(selectedQuickLink, data.instanceId);
    } else {
        var gr = new GlideRecord('sn_ex_sp_quick_link');
        gr.orderBy('sys_created_on');
        if (gr.query() && gr.next()) {
            selectedQuickLink = gr.sys_id.toString();
            data.json_data = quickLinkUtil.fetchQuicklinksForHomePage(selectedQuickLink, data.instanceId);
        } else {
            data.json_data = [];
        }
    }

    if (!data.title && selectedQuickLink) {
        var grTitle = new GlideRecord('sn_ex_sp_quick_link');
        if (grTitle.get(selectedQuickLink)) {
            data.title = grTitle.name.toString();
        }
    }

    if (input && input.action === "openGuidedhelp" && input.guidedHelpId) {
        var portal = $sp.getPortalRecord();
        data.pageId = $sp.getParameter("id") ? $sp.getParameter("id") : (portal && portal.homepage.getDisplayValue());
        data.guidedHelpResponse = quickLinkUtil.handleGuidedHelpClick(input.guidedHelpId, data.pageId, "quick_link");
    }
})();
\`\`\`

---

## Client Script

\`\`\`javascript
api.controller = function($scope, $timeout, $window) {
    var c = this;
    $scope.isLoading = false;

    $scope.clicked = function(item) {
        if (item.type === "guided_help") {
            c.server.get({
                action: "openGuidedhelp",
                guidedHelpId: item.guided_help
            }).then(function(resp) {
                $timeout(function() {
                    $window.open(resp.data.guidedHelpResponse.url, "_self");
                });
            });
        }
    };

    c.asyncGet = function() {
        $scope.isLoading = true;
        c.data.action = "loadData";
        c.server.update().then(function() {
            $scope.isLoading = false;
        });
    };

    if (c.data.load_config === "async") {
        setTimeout(c.asyncGet);
    }
};
\`\`\`

---

## Final Result

You’ll get a responsive set of colorful cards centered on the page.  
Each card links to a different ServiceNow page or resource.

<div class="blog-image">
<img src="images/b1img1.png" alt="Quick Links Widget Before Hover" />
</div>

<div class="blog-image">
  <img src="images/b1img2.png" alt="Quick Links Widget After Hover" />
</div>

This widget works especially well on **Employee Center portals**.

© 2026 Rohan Aditya`
    },
    {
        id: '1002',
        title: 'Show Table Data in Modal – Native UI',
        category: 'Tutorial',
        excerpt: 'Learn how to fetch dynamic table data and display it inside a GlideModal using UI Actions, UI Pages, and GlideAjax in ServiceNow.',
        tags: ['GlideModal', 'UI Page', 'GlideAjax'],
        date: '2025-07-02',
        views: 890,
        created: '2025-07-02T10:30:00Z',
        content: `

**Author: Rohan Aditya**

## Key Points Covered

- Fetching table data dynamically  
- Displaying records inside a modal  
- Using GlideModal with UI Page  
- GlideAjax + Script Include integration  
---

## Create the UI Action

**Navigation:** All > System UI > UI Actions > New  

**Configuration:**

- Name: Show table data  
- Table: Any table (or Global)  
- Action name: show_pop_up  
- Onclick: openModal();  

### Script

\`\`\`javascript
function openModal() {
  var gm = new GlideModal("list_on_popup_page");
  gm.setTitle("Table Data");
  gm.render();
}
\`\`\`

---

## Create the UI Page

**Navigation:** All > System UI > UI Pages > New  

**Configuration:**

- Name: list_on_popup_page  
- Application: Global (or your scoped app)  
- Category: General  

---

### HTML

\`\`\`xml
<?xml version="1.0" encoding="utf-8" ?>
<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide">
  <html>
  <head>
    <style>
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; }
      th { background-color: #f2f2f2; }
    </style>
  </head>
  <body>
    <p id="err_message" style="display:none; color:red;"></p>

    <label>Select a Table</label>
    <g:ui_reference name="target_table_pick" table="sys_db_object" />

    <button onclick="return onShowList();">Show List</button>

    <div id="listContainer" style="margin-top: 20px;"></div>
  </body>
  </html>
</j:jelly>
\`\`\`

---

### Client Script (UI Page)

\`\`\`javascript
function onShowList() {
  clearErr();

  var sysId = gel('target_table_pick').value.trim();
  if (!sysId) {
    $j("#err_message").html("Please select a table.").show();
    return false;
  }

  var ga = new GlideAjax('GetTableRecordsAJAX');
  ga.addParam('sysparm_name', 'getRecords');
  ga.addParam('sysparm_table_sysid', sysId);

  ga.getXMLAnswer(function(response) {
    $j('#listContainer').html(response);
  });

  return false;
}

function clearErr() {
  $j("#err_message").hide().html("");
}
\`\`\`

---

## Create the Script Include

**Navigation:** All > System Definition > Script Includes > New  

**Configuration:**

- Name: GetTableRecordsAJAX  
- Client Callable: True  

\`\`\`javascript
var GetTableRecordsAJAX = Class.create();
GetTableRecordsAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  getRecords: function() {

    var sysId = this.getParameter('sysparm_table_sysid');
    var gr = new GlideRecord('sys_db_object');

    if (!gr.get(sysId)) {
      return "<p>Invalid sys_id.</p>";
    }

    var tableName = gr.getValue('name');
    var grData = new GlideRecord(tableName);

    grData.setLimit(5);
    grData.query();

    var html = "<table><tr>";

    if (grData.isValidField('number')) html += "<th>number</th>";
    if (grData.isValidField('name')) html += "<th>name</th>";
    if (grData.isValidField('short_description')) html += "<th>short_description</th>";
    if (grData.isValidField('state')) html += "<th>State</th>";

    html += "</tr>";

    while (grData.next()) {
      html += "<tr>";

      if (grData.isValidField('number'))
        html += "<td>" + grData.getValue('number') + "</td>";

      if (grData.isValidField('name'))
        html += "<td>" + grData.getValue('name') + "</td>";

      if (grData.isValidField('short_description'))
        html += "<td>" + grData.getValue('short_description') + "</td>";

      if (grData.isValidField('state'))
        html += "<td>" + grData.getDisplayValue('state') + "</td>";

      html += "</tr>";
    }

    html += "</table>";

    return html;
  }
});
\`\`\`

---

## How It Works

✔️ Click the UI Action → Opens a GlideModal with your UI Page.  

✔️ Pick any table → Click **Show List** → Data displays dynamically inside the modal.  

✔️ No page reloads — Everything runs using **GlideAjax + Jelly + Client Script**.

---

## Result

Here’s how the final modal looks when you run it:

<div class="blog-image">
<img src="images/modal1.png" alt="Modal UI - Table Selection" />
</div>

<div class="blog-image">
  <img src="images/modal2.png" 
       alt="Modal UI - Table Data Loaded" />
</div>

<div class="blog-image">
  <img src="images/modal3.png" 
       alt="Modal UI - Multiple Records View" />
</div>

<div class="blog-image">
  <img src="images/modal4.png" 
       alt="Modal UI - Final Display" />
</div>

© 2026 Rohan Aditya`
    },
    {
        id: '1003',
        title: 'Use Script Include in Condition Filter or Reports',
        category: 'Tutorial',
        excerpt: 'Break past Condition Builder limitations by using a Script Include to dynamically filter records in lists and reports.',
        tags: ['Condition Builder', 'Reports', 'Sandbox enabled'],
        date: '2025-07-17',
        views: 922,
        created: '2025-07-17T09:15:00Z',
        content: `

**Author: Rohan Aditya**

## Key Points Covered

- Using scripting to enhance report filters  
- Bypassing limitations of Condition Builder  
- Dynamically filtering records using Script Include  

---

## Steps

Go to Script Includes

Navigation:  
**System Definition > Script Includes**

Click **New**.

---

Configure the Script Include

- Name: **ReportsAJAX**  
- Check: **Sandbox**  
- Ensure the Script Include name and method name match  

---

Paste the Script

This script returns all **Active P1 Incidents**.

\`\`\`javascript
function ReportsAJAX() {
  var incGr = new GlideRecord('incident');

  incGr.addActiveQuery();
  incGr.addQuery('priority', '1');
  incGr.query();

  var incidentArray = [];

  while (incGr.next()) {
    incidentArray.push(incGr.sys_id.toString());
  }

  return incidentArray;
}
\`\`\`

🚨 **Important:**  
If *Sandbox* isn't checked, your script won't work — and you'll start questioning every life choice that led to this moment.

---

## How to Use It in a Filter

When filtering incidents:

\`\`\`
SYS ID → is one of → javascript:ReportsAJAX();
\`\`\`

And boom — the Condition Builder starts behaving like it understands what you want. ✨

---

## How to Use It in a Report

In the **Report Condition**, add:

\`\`\`
SYS ID → is one of → javascript:ReportsAJAX();
\`\`\`

Now your report dynamically pulls only Active P1 incidents.
<div class="blog-image">
<img src="images/b3img1.png" alt="Script Include in Condition Builder" />
</div>

---

## What's Happening Behind the Scenes

- The Script Include runs server-side.
- It returns an array of sys_ids.
- The Condition Builder evaluates the JavaScript.
- The filter dynamically includes matching records.

Clean. Dynamic. Powerful.

---

© 2026 Rohan Aditya`
    },
    {
        id: '1004',
        title: 'Automate Creation of Product and Sold Product Records from Excel via Flow and Transform Map',
        category: 'Use Case',
        excerpt: 'A practical automation approach to creating Product and Sold Product records directly from Excel attachments using Flow Designer and Transform Maps.',
        tags: ['Flow Designer', 'Transform Map', 'Import Set'],
        date: '2025-08-08',
        views: 430,
        created: '2025-08-08T10:00:00Z',
        content: `

**Author: Rohan Aditya**


## Key Points Covered

- Triggering Transform Map from Flow Designer  
- Establishing relation between Import Set & Requested Item  
- Automating Product and Sold Product creation  
- Adding clickable links back to RITM  

---

Hi everyone 👋  
I'd like to share a practical use case we implemented in ServiceNow.

---

## Use Case Overview

Create **Product** and **Sold Product** records in ServiceNow by simply submitting a Catalog Item with an Excel file attachment containing product details.

---

## Approach

- Create a Catalog Item  
- Trigger a Flow when the Catalog Item is submitted  
- In the Flow, trigger a Transform Map that processes the uploaded Excel file  
- Use Transform Scripts to create Products and Sold Products  
- Add a comment to the RITM containing clickable links to created records  

---

### Implementation Steps

---

##Catalog Item Configuration

The Catalog Item includes a primary question:

**"Number of products to create"**

Options:
- Single Product  
- Multiple Products  

### If Single Product is selected:

Show questions for:
- Name of Product  
- Product Model Number  
- Model Category  
- Link Accounts? (Yes/No)  

If **Yes**, allow account selection.

<div class="blog-image">
<img src="images/b4img1.png" alt="Catalog Item - Single Product Setup" />
</div>

---

### If Multiple Products is selected:

- Provide Excel template download link  
- Ask user to upload filled Excel file  

<div class="blog-image">
<img src="images/b4img2.png" alt="Catalog Item - Multiple Product Setup" />
</div>

---

##Flow Designer Configuration

Create a Flow triggered on Service Catalog submission.

<div class="blog-image">
<img src="images/b4img3.png" alt="Flow Designer Trigger Setup" />
</div>

### Flow Steps:

- Look Up Attachment  
- Copy Attachment  
- Custom Action → Get Import Set  
<div class="blog-image">
<img src="images/b4img4.png" alt="Custom Action - Get Import Set" />
</div>
<div class="blog-image">
<img src="images/b4img5.png" alt="Custom Action - Get Import Set" />
</div>
<div class="blog-image">
<img src="images/b4img6.png" alt="Custom Action - Get Import Set" />
</div>
<div class="blog-image">
<img src="images/b4img7.png" alt="Custom Action - Get Import Set" />
</div>  
- Look Up Data Source  
<div class="blog-image">
<img src="images/b4img8.png" alt="Look Up Data Source" />
</div>
- Look Up Import Set Records  
<div class="blog-image">
<img src="images/b4img9.png" alt="Look Up Import Set Records" />
</div>  
- Trigger Transform Map
<div class="blog-image">
<img src="images/b4img10.png" alt="Trigger Transform Map" />
</div>  
<div class="blog-image">
<img src="images/b4img11.png" alt="Trigger Transform Map" />
</div> 
<div class="blog-image">
<img src="images/b4img12.png" alt="Trigger Transform Map" />
</div> 
- Delete Copied Attachment  
- Update Requested Item  
- Add Work Notes with clickable links  
- Activate Flow  

---

### Custom Script Include

\`\`\`javascript
var KapCreateProductUtils = Class.create();
KapCreateProductUtils.prototype = {
    initialize: function() {},

    getImportSetSysId: function(ritmSysId) {
        var dataSourceSysId = gs.getProperty('kap.create.product.data.source.sys.id');

        var grDataSource = new GlideRecord('sys_data_source');
        if (grDataSource.get(dataSourceSysId)) {
            var loader = new GlideImportSetLoader();
            var importSetRec = loader.getImportSetGr(grDataSource);
            loader.loadImportSetTable(importSetRec, grDataSource);

            importSetRec.state = "loaded";
            importSetRec.update();

            var importTableName = importSetRec.getValue("table_name");

            if (!importTableName) {
                gs.error("Import Set Table Name is null. Cannot proceed.");
                return;
            }

            var rowGR = new GlideRecord(importTableName);
            rowGR.addQuery("import_set", importSetRec.getUniqueValue());
            rowGR.query();
            while (rowGR.next()) {
                rowGR.u_requested_item = ritmSysId;
                rowGR.update();
            }

            return importSetRec.getUniqueValue();
        }

        return null;
    },

    triggerTransformMap: function(importSetRecSysID) {
        var transformSysId = gs.getProperty('kap.create.product.transform.map.sys.id');

        var transformWorker = new GlideImportSetTransformerWorker(importSetRecSysID, transformSysId);
        transformWorker.setBackground(true);
        transformWorker.start();
    },
    type: 'KapCreateProductUtils'
};
         
\`\`\`

---

### Transform Maps

- Create Import Set Table 
<div class="blog-image">
<img src="images/b4img13.png" alt="Trigger Transform Map" />
</div> 
- Create Transform Map
<div class="blog-image">
<img src="images/b4img14.png" alt="Create Transform Map" />
</div> 
- Configure Field Mappings 
<div class="blog-image">
<img src="images/b4img15.png" alt="Configure Field Mappings" />
</div> 
- Populate RITM Number in Product Comments 
<div class="blog-image">
<img src="images/b4img16.png" alt="Populate RITM Number in Product Comments" />
</div>  

---

## onAfter Transform Script  
(Create Sold Product after Product creation)

\`\`\`javascript

(function runTransformScript(source, map, log, target) {


    var productSysId = target.sys_id.toString();
    var productName = source.u_name_of_the__demo_product_1;


    if (!productSysId || !productName) {
        return;
    }


    // If accounts are specified
    if (source.u_which_accoun_d_to_be_linked && source.u_which_accoun_d_to_be_linked.trim() !== '') {


        var accountNames = source.u_which_accoun_d_to_be_linked.split(/\s*,\s*/);
        var validAccounts = [];
        for (var i = 0; i < accountNames.length; i++) {
            if (isValidAccount(accountNames[i])) {
                validAccounts.push(accountNames[i]);
            }
        }
        var accountGr = new GlideRecord('customer_account');
        accountGr.addQuery('name', 'IN', validAccounts);
        accountGr.query();
        while (accountGr.next()) {
            createSoldProduct(productSysId, productName, accountGr.sys_id.toString(), accountGr.name.toString());
        }
        if (accountNames.length != validAccounts.length) { // Use generic account var
            genericAccountSysId = gs.getProperty('kap.sold.product.generic.account.sys.id');
            if (genericAccountSysId) {
                var genericAccountGr = new GlideRecord('customer_account');
                if (genericAccountGr.get(genericAccountSysId)) {
                    createSoldProduct(productSysId, productName, genericAccountSysId, genericAccountGr.name.toString());
                }
            }
        }
    } else {
        // Use generic account 
        var genericAccountId = gs.getProperty('kap.sold.product.generic.account.sys.id');
        if (genericAccountId) {
            var
                genericAccGr = new GlideRecord('customer_account');
            if (genericAccGr.get(genericAccountId)) {
                createSoldProduct(productSysId, productName, genericAccountId, genericAccGr.name.toString());
            }
        }
    }
    //Reusable function to insert a Sold Product
    function createSoldProduct(productId, productName, accountId,
        accountName) {
        var soldProduct = new GlideRecord('sn_install_base_sold_product');
        soldProduct.initialize();
        soldProduct.product = productId;
        soldProduct.account = accountId;
        soldProduct.name = productName + ' - ' +
            accountName;
        soldProduct.insert();
    }

    function isValidAccount(accountName) {
        var accountGr = new
        GlideRecord('customer_account');
        accountGr.addQuery('name', accountName);
        accountGr.query();
        if (accountGr.hasNext()) {
            return true;
        }
        return false;
    }
})(source, map, log, target);
\`\`\`

---

## onComplete Transform Script  
(Add clickable links to RITM)

\`\`\`javascript
(function runTransformScript(source, map, log, target /*undefined onStart*/ ) {

    var rowGr = new GlideRecord(source.getTableName());
    rowGr.addQuery('import_set', source.import_set);
    rowGr.query();

    if (!rowGr.next() || !rowGr.u_requested_item) {
        return;
    }

    var ritmRef = rowGr.u_requested_item;

    // Get Products
    var productGr = new GlideRecord(target.getTableName());
    productGr.addQuery('sys_created_by', 'system');
    productGr.addQuery('comments', 'CONTAINS', ritmRef.number);
    productGr.query();

    var productSysIds = [];

    while (productGr.next()) {
        productSysIds.push(productGr.getValue('sys_id'));
    }

    // Get Sold Products by checking product.comments CONTAINS RITM number
    var soldSysIds = [];
    var soldGr = new GlideRecord('sn_install_base_sold_product');
    soldGr.addQuery('sys_created_by', 'system');
    soldGr.addEncodedQuery('productISNOTEMPTY');
    soldGr.addEncodedQuery('product.sys_idIN' + productSysIds);
    soldGr.query();
    while (soldGr.next()) {
        soldSysIds.push(soldGr.getValue('sys_id'));
    }

    if (productSysIds.length === 0 && soldSysIds.length === 0) {
        return;
    }

    var baseUrl = gs.getProperty('glide.servlet.uri');
    var commentText = '';

    if (productSysIds.length > 0) {
        var productListUrl = baseUrl + target.getTableName() + '_list.do?sysparm_query=sys_idIN' +
            productSysIds.join(',');
        commentText += 'Click <a href="' + productListUrl + '" target="_blank">here</a> to view the
        created Products.\n ';
    }

    if (soldSysIds.length > 0) {
        var soldListUrl = baseUrl + 'sn_install_base_sold_product_list.do?sysparm_query=sys_idIN' +
            soldSysIds.join(',');
        commentText += 'Click <a href="' + soldListUrl + '" target="_blank">here</a> to view the created
        Sold Products.
        ';
    }

    var ritmGR = new GlideRecord('sc_req_item');
    if (ritmGR.get(ritmRef)) {
        ritmGR.comments = commentText;
        ritmGR.update();
    }

})(source, map, log, target);
\`\`\`

---

### Output
<div class="blog-image">
<img src="images/b4img17.png" alt="Output" />
</div>

### Created Products

<div class="blog-image">
<img src="images/b4img18.png" alt="Created Products" />
</div> 

### Created Sold Products

<div class="blog-image">
<img src="images/b4img19.png" alt="Created Sold Products" />
</div> 
---

Clean. Automated. Scalable.  
Upload Excel → Submit Catalog → Products & Sold Products Created Automatically.

---

© 2026 Rohan Aditya`
    },
    {
        id: '1005',
        title: 'SOW to CSM/FSM Workspace Migration',
        category: 'Tutorial',
        excerpt: 'Complete configuration guide for updating UI Actions and Workspace components during SOW to CSM/FSM Configurable Workspace migration.',
        tags: ['Workspace Migration', 'SOW to CSM', 'UI Builder'],
        date: '2025-10-07',
        views: 200,
        created: '2025-10-07T10:00:00Z',
        content: `

**Author: Rohan Aditya**

## Key Points Covered

- Conflict Calendar on Change  
- Risk Assessment on Change  
- Completed Risk Assessment on Change  
- Check Conflicts on Change  
- Create Request on Incident  

---

When migrating from **Service Operations Workspace (SOW)** to **CSM/FSM Configurable Workspace**, several UI Actions require modification.

If these steps are skipped, buttons may not appear, redirect incorrectly, or fall back to Classic UI.

This guide covers all required configurations.

---

### Conflict Calendar on Change

Open UI Action  
\`\`\`javascript  
sys_id: a8b7eac20b1332005775aabcb4673ae2  
\`\`\`

### Required Configuration

- ✔ Enable **Workspace Form Button** or **Workspace Form Menu**
- ✔ Check **Format for Configurable Workspace**

---

### Workspace Client Script

\`\`\`javascript
function onClick(g_form) {
    var sys_id = g_form.getUniqueValue();
    var url = top.location.href;

    var routeGr = new GlideAjax('KAPChangeUtils');
    routeGr.addParam('sysparm_name','getBaseURL');
    routeGr.getXMLAnswer(function(response){
        var route = url.split(response);
        var newUrl = route[1] + '/sub/change-conflict-calendar/' + sys_id;
        open(newUrl, '_self');
    });
}
\`\`\`

---

### Script Include (Required)

Create Script Include:

- Name: **KAPChangeUtils**
- Application: Global
- Accessible from: All scopes
- Client Callable: ✔ True
- Active: ✔ True
- Mobile Callable: False
- Sandbox: False

\`\`\`javascript
var KAPChangeUtils = Class.create();
KAPChangeUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  getBaseURL: function(){
    return gs.getProperty('glide.servlet.uri').toString();
  },
  type: 'KAPChangeUtils'
});
\`\`\`

---

### Create Page in UI Builder

1. Open **UI Builder**
2. Select **CSM/FSM Configurable Workspace**
3. Click ➕ beside *Pages and Variants*
<div class="blog-image">
<img src="images/b5img1.png" alt="Weather Widget Output in Service Portal" />
</div>
4. Select **Create a new page**
<div class="blog-image">
<img src="images/b5img2.png" alt="Weather Widget Output in Service Portal" />
</div>
5. Choose **Create from scratch instead**
<div class="blog-image">
<img src="images/b5img3.png" alt="Weather Widget Output in Service Portal" />
</div>
6. Name it: **Change Conflict Calendar**
<div class="blog-image">
<img src="images/b5img4.png" alt="Weather Widget Output in Service Portal" />
</div>  
7. URL Path must be:  
   \`change-conflict-calendar\`  ⚠ (Must match client script)

### Required Parameter

Add parameter:
- Name: **SysId**

Select **Build responsive**

---

### Macroponent Configuration

1. Open the newly created page
<div class="blog-image">
<img src="images/b5img5.png" alt="Weather Widget Output in Service Portal" />
</div>
2. Click **Settings**
<div class="blog-image">
<img src="images/b5img6.png" alt="Weather Widget Output in Service Portal" />
</div>
3. Under Actions → Open records → Select **Variant record**
<div class="blog-image">
<img src="images/b5img7.png" alt="Weather Widget Output in Service Portal" />
</div>
4. Clear:
   - Macroponent configuration
   - Event mapping fields
5. Set **App Configuration** to your CSM/FSM Workspace, Now open Page Definition.
<div class="blog-image">
<img src="images/b5img8.png" alt="Weather Widget Output in Service Portal" />
</div>
6. Copy the values from the fields (Layout Model, Composition, Data, Internal Event Mapping, Properties, Dispatched Events, and State) in the OOB record, paste them into your new UX Macroponent Definition record, and then save the record..

Now we have Conflict Calendar form button in CSM/ FSM Configurable workspace. After clicking on Conflict Calendar we get,
<div class="blog-image">
<img src="images/b5img9.png" alt="Weather Widget Output in Service Portal" />
</div>

---

### Copy OOB Macroponent Definition

Using SN Utils:

Open OOB record:
\`\`\`javascript
sys_id: 4b5a6af60b0d1110c85e8a8db777b270  
\`\`\`
Title: *Change Conflict Calendar default*

Copy these fields into your new page:

- Layout Model  
- Composition  
- Data  
- Internal Event Mapping  
- Properties  
- Dispatched Events  
- State  

Save.

Now Conflict Calendar works properly in CSM/FSM Workspace.

---

### Risk Assessment on Change

Open UI Action
\`\`\`javascript  
sys_id: 8d300156d7033200532c24837e6103e8  
\`\`\`

### Enable

- Workspace Form Button/Menu
- Format for Configurable Workspace

---

### Workspace Client Script

\`\`\`javascript
function onClick(g_form) {
    invokeAssessment();
}
\`\`\`

This script:

- Handles dirty form validation
- Invokes GlideAjax
- Launches assessment modal
- Handles completed vs new assessment
- Encodes return URL correctly

⚠ Do NOT remove modal logic — Workspace depends on it.

---

### Completed Risk Assessment on Change

Open UI Action
\`\`\`javascript  
sys_id: 5406d544b7612300da26e4f6ee11a9c3  
\`\`\`
Enable Workspace options.

\`\`\`javascript
function onClick(g_form) {
    viewCompleted();
}
\`\`\`

This:

- Validates completed assessments
- Opens assessment in reader mode
- Displays modal using g_modal.showFrame()

---

### Check Conflicts on Change

Open UI Action  
\`\`\`javascript
sys_id: d3668ab84a36232b00bbd765d0e94336  
\`\`\`
Enable:
- Active
- Workspace Form Button/Menu
- Configurable Workspace format

\`\`\`javascript
function onClick(g_form) {

    var fields = [];
    var missingLabels = [];

    if (g_form.hasField("start_date") && !g_form.getValue("start_date")) {
        fields.push("start_date");
        missingLabels.push(g_form.getLabelOf("start_date"));
    }

    if (g_form.hasField("end_date") && !g_form.getValue("end_date")) {
        fields.push("end_date");
        missingLabels.push(g_form.getLabelOf("end_date"));
    }

    if (g_form.hasField("cmdb_ci") && !g_form.getValue("cmdb_ci")) {
        fields.push("cmdb_ci");
        missingLabels.push(g_form.getLabelOf("cmdb_ci"));
    }

    if (missingLabels.length > 0) {
        var msg = (missingLabels.length > 1) ?
            "To check conflicts, the following fields need values: " + missingLabels.join(", ") :
            "To check conflicts, the following field needs a value: " + missingLabels[0];

        g_form.addErrorMessage(msg);

        fields.forEach(function(field) {
            g_form.showFieldMsg(field, "Required for conflict check", "error", false);
        });

        return;
    }

    g_form.clearMessages();
    g_form.submit("check_conflicts");
}
\`\`\`

Ensures mandatory fields are validated before submission.

---

### Create Request on Incident

Open Action Assignment  
\`\`\`javascript
sys_id: b7980ba483b76e10ccf85d70deaad32e  
\`\`\`

⚠ Instead of new UI Action:

1. Open Action Assignment record
2. Insert and Stay
3. Clear View field
4. Enable ✔ **Enable for all Configurable Experiences**
5. Save

This ensures button appears in Workspace.

---

### Final Notes

During SOW → CSM/FSM migration:

- UI Actions must be Workspace-enabled
- Client scripts must be updated
- Pages may need recreation in UI Builder
- OOB Macroponent data must be copied
- Action Assignments must be enabled

Migration is not just enabling Workspace —  
it's reconfiguring it properly.

---

© 2026 Rohan Aditya`
    },
    {
        id: '1006',
        title: 'Autopopulate Fields in Mobile Input Form',
        category: 'Tutorial',
        excerpt: 'Learn how to dynamically prefill fields in ServiceNow Agent Mobile using Mobile Callable Script Includes and scripted variables.',
        tags: ['Agent Mobile', 'Script Include', 'Automation'],
        date: '2025-11-05',
        views: 625,
        created: '2025-11-05T10:00:00Z',
        content: `

**Author: Rohan Aditya**

## Key Points Covered

- Why your Script Include ignores you in Mobile  
- Understanding Mobile Callable Script Includes  
- Autopopulating fields dynamically in Mobile Input Forms  

---

### Why It Refuses to Work and How to Convince It

Your Script Include isn't working in the mobile input form?

You double-checked the code.  
Cleared cache.  
Maybe even whispered a prayer.

Still nothing. Classic developer déjà vu.

Usually, it's one of these two sneaky culprits:

**Mobile Callable is unchecked**  
If the *Mobile Callable* checkbox isn't enabled, the Agent Mobile app completely ignores your Script Include — like that one teammate who reads messages but never replies.

**Returning only sys_id**  
Mobile doesn't want just the sys_id like desktop UI does.  
It expects a JSON object with both:

- Value  
- DisplayValue  

Return only one, and your field stays blank.

Fix these two things — and your form finally comes to life.

No rituals required.

---

### Use Case: Populating Assignment Group Automatically

Imagine a mobile form where users create an **Incident** or **Case**, and you want the **Assignment Group** to automatically populate with a default value — for example, *IT Service Desk*.

Instead of selecting it manually every time:

- The form loads  
- Script runs  
- Field auto-fills  

Faster. Cleaner. Consistent.

---

### Implementation Steps

## Step 1: Create Script Include

Navigation:  
System Definition > Script Includes  

Create a new Script Include:

- Mark as **Mobile Callable**
- Return both **Value** and **DisplayValue**

### Example Script Include

\`\`\`javascript
var MobileUtils = Class.create();
MobileUtils.prototype = {

    populateDefaultAssignmentGroup: function() {

        var gr = new GlideRecord('sys_user_group');
        gr.addQuery('name', 'IT Service Desk');
        gr.query();

        if (gr.next()) {
            return {
                value: gr.getUniqueValue(),
                displayValue: gr.getDisplayValue('name')
            };
        }

        return {};

    },

    type: 'MobileUtils'
};
\`\`\`

---

## Step 2: Create Assignment Group Variable

In your **Mobile Input Form**:

- Create a new variable  
- Type: **Scripted**

<div class="blog-image">
<img src="images/b6img1.png" alt="Create Assignment Group Variable in Mobile App" />
</div>

---

## Step 3: Configure Variable Attribute (Script)

Open the variable's **Attributes**:

- Value:

\`\`\`
MobileUtils.populateDefaultAssignmentGroup();
\`\`\`

<div class="blog-image">
<img src="images/b6img2.png" alt="Set Script Attribute in ServiceNow" />
</div>

---

## Step 4: Configure Autofill Variable

In your Assignment Group input field:

- Set **Autofill Variable**  
- Select the scripted variable created earlier  

<div class="blog-image">
<img src="images/b6img3.png" alt="Assignment Group Autofilled in Mobile Form" />
</div>

---

### Final Result

Now when the form opens in **ServiceNow Agent Mobile**:

- Assignment Group is already populated  
- Users don't need to select manually  
- Data consistency improves  

Simple tweak.  
Big usability win.

---

© 2026 Rohan Aditya`
    },
    {
        id: '1007',
        title: 'Fetching Weather Data in ServiceNow Using REST APIs',
        category: 'Use Case',
        excerpt: 'Learn how to call a Weather API in ServiceNow using RESTMessageV2 and build a dynamic Weather Forecast Widget in Service Portal.',
        tags: ['REST API', 'Portal', 'Integration'],
        date: '2025-12-07',
        views: 300,
        created: '2025-12-07T10:00:00Z',
        content: `

**Author: Rohan Aditya**


## Key Points Covered

- Calling Weather API  
- Building a Weather Widget  
- Using Instance Options  
- Rendering Weather UI in Portal  

---

Let's be honest — Weather Widgets look cool.  
And building one in ServiceNow? Even cooler 😎  

In this tutorial, we consume the WeatherAPI.com service using \`sn_ws.RESTMessageV2()\` and render a clean UI in a Service Portal Widget.

---

### Quick Navigation

- API Explanation  
- Server Script  
- Client Script  
- Instance Options Schema  
- Widget HTML  
- Download XML  

---

### Calling Weather API in ServiceNow

We call the external API using RESTMessageV2, fetch today's weather, calculate a 3-day forecast, and pass structured data to the widget.

---

## Server Script

\`\`\`javascript
(function () {

    try {
        var city = (options.city || "Hyderabad").replace(/ /g, "%20");
        var startDate = normalizeDate(options.start_date);

        var apiKey = gs.getProperty('weather.api.key');
        var url = "https://api.weatherapi.com/v1/forecast.json?key= " + apiKey +
                  "&q=" + city + "&days=3&aqi=no&alerts=no";

        var r = new sn_ws.RESTMessageV2();
        r.setEndpoint(url);
        r.setHttpMethod("GET");

        var result = JSON.parse(r.execute().getBody());

        var apiToday = result.forecast.forecastday[0].date;

        var displayToday = startDate || apiToday;
        var disp1 = computeNextDate(displayToday, 1);
        var disp2 = computeNextDate(displayToday, 2);

        data.weather = {
            city: result.location.name + ", " + result.location.country,
            temp: result.current.temp_c,
            icon_url: "https:" + result.current.condition.icon,
            date: formatPrettyDate(displayToday)
        };

        data.forecast = [
            {
                date: formatPrettyDate(disp1),
                avg_temp: result.forecast.forecastday[1].day.avgtemp_c,
                icon_url: "https:" + result.forecast.forecastday[1].day.condition.icon
            },
            {
                date: formatPrettyDate(disp2),
                avg_temp: result.forecast.forecastday[2].day.avgtemp_c,
                icon_url: "https:" + result.forecast.forecastday[2].day.condition.icon
            }
        ];

    } catch (ex) {
        data.error = ex.message;
    }

    function normalizeDate(inputDate) {
        if (!inputDate) return "";
        var gdt = new GlideDateTime();
        gdt.setDisplayValue(inputDate);
        return gdt.getLocalDate().toString();
    }

    function computeNextDate(dateStr, addDays) {
        var gdt = new GlideDateTime(dateStr + " 00:00:00");
        gdt.addDaysLocalTime(addDays);
        return gdt.getLocalDate().toString();
    }

    function formatPrettyDate(dateStr) {
        var p = dateStr.split("-");
        var monthIndex = parseInt(p[1], 10) - 1;
        var day = parseInt(p[2], 10);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[monthIndex] + " " + day;
    }

})();
\`\`\`

---

## Client Controller

The client controller passes configuration and renders the response.

\`\`\`javascript
api.controller = function($scope) {
  var c = this;
};
\`\`\`

---

## Instance Options Schema

This schema allows configuring default city and start date directly from widget instance settings.

\`\`\`json
[
  {
    "name":"city",
    "section":"other",
    "label":"Default City",
    "type":"string"
  },
  {
    "hint":"DD-MM-YYYY",
    "name":"start_date",
    "section":"other",
    "label":"Start Date",
    "type":"string"
  }
]
\`\`\`

---

## Widget HTML

\`\`\`html
<div class="weather-widget">
  <h3>{{data.weather.city}}</h3>

  <div class="forecast-card">
    <img ng-src="{{data.weather.icon_url}}">
    <div>{{data.weather.temp}}°C</div>
    <div>{{data.weather.date}}</div>
  </div>

  <div class="all-weather">
    <div class="forecast-card" ng-repeat="day in data.forecast">
      <img ng-src="{{day.icon_url}}">
      <div>{{day.avg_temp}}°C</div>
      <div>{{day.date}}</div>
    </div>
  </div>
</div>
\`\`\`

---

## Download XML

The complete widget logic is documented above (Server Script, Client Controller, Instance Options, HTML).

You can export the full Widget XML file from ServiceNow for reuse.
<div class="download-container">
    <a href="https://raw.githubusercontent.com/aytid/servicenow/main/Weather-API-Widget.xml " 
       download="Weather-API-Widget.xml"
       class="download-btn">
        <svg class="download-icon" xmlns="http://www.w3.org/2000/svg " width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span class="download-text">Download Widget XML</span>
    </a>
    <span class="download-meta">Weather-API-Widget.xml • 2.4 KB</span>
</div>
---

### Final Output

This is how the Weather Widget appears in Service Portal:

<div class="blog-image">
<img src="images/b7img1.png" alt="Weather Widget Output in Service Portal" />
</div>

Clean API integration.  
Dynamic configuration.  
Reusable Widget architecture.

---

© 2026 Rohan Aditya`
    },
    {
        id: '1008',
        title: 'ServiceNow Portal Video Widget',
        category: 'Tutorial',
        excerpt: 'Build a modern, interactive background video banner widget for ServiceNow Service Portal with overlay content and flexible instance options.',
        tags: ['Portal', 'Video Widget', 'UI/UX'],
        date: '2025-12-24',
        views: 250,
        created: '2025-12-24T10:00:00Z',
        content: `

**Author: Rohan Aditya**

## Overview

Modern portals feel alive. Static banners are outdated — but a clean background video? That changes everything.

In this tutorial, we build a **responsive background video widget** for ServiceNow Service Portal.  
The widget supports overlay content like search bars, headings, and dynamic widgets — all configurable via instance options.

---

### Widget Structure

This widget contains:

- Background video container  
- Overlay layer (dark gradient for readability)  
- Centered content section  
- Optional embedded search widget  

---

## Instance Options Schema

Allows dynamic configuration without modifying code.

\`\`\`json
[
  {
    "name": "video_url",
    "section": "other",
    "label": "Background Video URL",
    "type": "string"
  },
  {
    "name": "heading_text",
    "section": "other",
    "label": "Banner Heading",
    "type": "string"
  },
  {
    "name": "sub_text",
    "section": "other",
    "label": "Sub Heading",
    "type": "string"
  }
]
\`\`\`

---

### Server Script

\`\`\`javascript
(function() {

    data.video_url = options.video_url || "";
    data.heading_text = options.heading_text || "Welcome to Service Portal";
    data.sub_text = options.sub_text || "Search anything you need";

})();
\`\`\`

---

### Widget HTML

\`\`\`html
<div class="video-banner">

  <video autoplay muted loop playsinline class="background-video">
    <source ng-src="{{data.video_url}}" type="video/mp4">
  </video>

  <div class="overlay"></div>

  <div class="content">
    <h1>{{data.heading_text}}</h1>
    <p>{{data.sub_text}}</p>

    <!-- Example: Embedded Search Widget -->
    <sp-widget widget="widget-search"></sp-widget>

  </div>

</div>
\`\`\`

---

### CSS Styling

\`\`\`css
.video-banner {
  position: relative;
  height: 80vh;
  overflow: hidden;
}

.background-video {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.45);
}

.content {
  position: relative;
  z-index: 2;
  color: #ffffff;
  text-align: center;
  top: 50%;
  transform: translateY(-50%);
}

.content h1 {
  font-size: 42px;
  font-weight: 600;
}

.content p {
  font-size: 18px;
  margin-top: 10px;
}
\`\`\`

---

### Final Output

This is how the background video banner appears in Service Portal:

<div class="blog-image">
<img src="images/video-widget-output.png" alt="ServiceNow Portal Video Widget Output" />
</div>

---

© 2026 Rohan Aditya`
    },
    {
        id: '1009',
        title: 'Convert Data from CSV File to JSON',
        category: 'Use Case',
        excerpt: 'Automate CSV attachment processing in ServiceNow using Flow Designer and convert Import Set data into a structured JSON object.',
        tags: ['Flow Designer', 'Import Set', 'CSV Processing', 'JSON Conversion'],
        date: '2026-01-08',
        views: 280,
        created: '2026-01-08T10:00:00Z',
        content: `

**Author: Rohan Aditya**

## Use Case Overview

An internal user submits a Catalog Item with a CSV file attached. Once the request is submitted,
the system processes the attachment, reads the data from the CSV file, and converts the CSV data into a structured JSON object.
This JSON object can then be used for further processing such as creating or updating records in the system

---

## High-Level Flow Design

1. Catalog Item submitted with CSV attachment  
2. Flow triggers on RITM creation  
3. Attachment copied to a Data Source  
4. Custom Action runs Import Set  
5. Staged data converted to JSON  
6. Attachment deleted from Data Source  

---

## Custom Action – Inputs & Outputs

<div class="blog-image">
<img src="images/b9img1.png" alt="Catalog Item - Single Product Setup" />
</div>


## Inputs

- **RITM Sys ID** – Reference to Requested Item  

<div class="blog-image">
<img src="images/b9img2.png" alt="Catalog Item - Single Product Setup" />
</div>


---

## Script Step

\`\`\`javascript

(function execute(inputs, outputs) {

    var ritmSysId = inputs.ritmSysId;
    var jsonResultList = [];

    var dataSourceSysId = gs.getProperty('kap.read.csv.data.source.sys.id');

    var att = new GlideSysAttachment();
    var attachment = att.getAttachments('sys_data_source', dataSourceSysId);

    if (!attachment || !attachment.hasNext()) {
        outputs.json_data = JSON.stringify({ "directAppsUserList": [] });
        return;
    }

    var grDataSource = new GlideRecord('sys_data_source');
    if (grDataSource.get(dataSourceSysId)) {

        var loader = new GlideImportSetLoader();
        var importSetRec = loader.getImportSetGr(grDataSource);

        loader.loadImportSetTable(importSetRec, grDataSource);
        importSetRec.state = "loaded";
        importSetRec.update();

        var importTableName = importSetRec.getValue("table_name");

        var rowGR = new GlideRecord(importTableName);
        rowGR.addQuery("sys_import_set", importSetRec.getUniqueValue());
        rowGR.query();

        while (rowGR.next()) {

            rowGR.u_ritm = ritmSysId;
            rowGR.update();

            jsonResultList.push({
                "directAppsUserEmail": rowGR.getValue('u_email'),
                "directAppsUserRetailerName": rowGR.getValue('u_retailer_name')
                    .replaceAll(' ', '')
                    .toLowerCase(),
                "directAppsUserSupplierNumber": rowGR.getValue('u_supplier_number')
            });
        }
    }

    outputs.json_data = JSON.stringify({
        "directAppsUserList": jsonResultList
    });

})(inputs, outputs);
\`\`\`

---

## Script Step Output Variable

- **JSON Data** – Final converted JSON object  
<div class="blog-image">
<img src="images/b9img3.png" alt="Catalog Item - Single Product Setup" />
</div>

---

## Sample JSON Output

\`\`\`json
{
  "directAppsUserList": [
    {
      "directAppsUserEmail": "user@example.com",
      "directAppsUserRetailerName": "retailername",
      "directAppsUserSupplierNumber": "SUP123"
    }
  ]
}
\`\`\`

---

This approach eliminates manual CSV parsing and provides a structured JSON output ready for integrations or API calls.

Clean. Automated. Integration-ready.

---

© 2026 Rohan Aditya`
    },
    {
        id: '1010',
        title: 'Automation in Reviewing Update Sets',
        category: 'Tutorial',
        excerpt: 'Build a UI Action and dynamic review modal to automatically detect DELETE and Cross-Scoped records before promoting update sets.',
        tags: ['Update Sets', 'Automation', 'UI Page'],
        date: '2026-02-24',
        views: 240,
        created: '2026-02-24T10:00:00Z',
        content: `

**Author: Rohan Aditya**

### Why Refine Update Sets?

Large update sets often contain:

- DELETE records  
- Cross-scoped updates  

Promoting them blindly can cause unexpected issues in higher environments.

Refining update sets before deployment ensures:

- Cleaner migrations  
- Reduced production risk  
- Better governance  

---
Instead of manually checking records like a digital archaeologist… we automate it.

### UI Action

Add a UI Action on **sys_update_set** table:

\`\`\`javascript
function openReviewModal() {
    var gm = new GlideModal('review_update_set');
    gm.setTitle('Checking Update Set');
    gm.setPreference('current_update_set', g_form.getUniqueValue());
    gm.setSize('large');
    gm.render();
}
\`\`\`

This opens a dynamic review modal.

---

### UI Page

The UI Page:

- Receives update set sys_id  
- Loads child update sets  
- Displays Scope  
- Renders DELETE & CROSS SCOPED tabs  
- Calls GlideAjax dynamically  

\`\`\`xml
<?xml version="1.0" encoding="utf-8" ?>
<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide">

    <g:evaluate>
        var currentUpdateSet = RP.getWindowProperties().get('current_update_set');
        var usName = "";
        var usScope = "";
        var childSets = [];

        var us = new GlideRecord('sys_update_set');
        if (us.get(currentUpdateSet)) {
            usName = us.getValue('name');
            usScope = us.application.getDisplayValue();
        }

        var child = new GlideRecord('sys_update_set');
        child.addQuery('parent', currentUpdateSet);
        child.orderBy('name');
        child.query();
        while (child.next()) {
            childSets.push({
                sys_id: child.getUniqueValue(),
                name: child.getValue('name'),
                created: child.getDisplayValue('sys_created_on')
            });
        }
    </g:evaluate>

    <g:ui_form>
        <!-- UI with dropdown, include child checkbox,
             and tabbed result section for deletes & cross scoped -->
    </g:ui_form>

</j:jelly>
\`\`\`

The UI dynamically builds:

- Update set selector  
- Include Child checkbox  
- Scope display  
- Tab navigation  
- Result tables  

---

### Script Include

Create Script Include:

- Name: **reviewUpdateSetAJAX**
- Client Callable: ✔ True

\`\`\`javascript
var reviewUpdateSetAJAX = Class.create();
reviewUpdateSetAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getData: function() {

        var usId = this.getParameter('update_set');
        var includeChildren = this.getParameter('include_children') == "true";

        var result = {
            deletes: [],
            cross: []
        };

        var updateSetIds = [usId];

        if (includeChildren) {
            var child = new GlideRecord('sys_update_set');
            child.addQuery('parent', usId);
            child.query();
            while (child.next()) {
                updateSetIds.push(child.getUniqueValue());
            }
        }

        var usGR = new GlideRecord('sys_update_set');
        if (!usGR.get(usId))
            return JSON.stringify(result);

        var xmlGR = new GlideRecord('sys_update_xml');
        xmlGR.addQuery('update_set', 'IN', updateSetIds.join(','));
        xmlGR.query();

        while (xmlGR.next()) {

            var nameField = xmlGR.name.toString();
            var recordSysId = nameField.slice(-32);
            var tableName = nameField.slice(0, nameField.length - 33);

            var rec = {
                sys_id: recordSysId,
                xml_sys_id: xmlGR.sys_id.toString(),
                type: xmlGR.type.toString(),
                target_name: xmlGR.target_name ? xmlGR.target_name.toString() : xmlGR.name.toString(),
                table: tableName,
                updated_by: xmlGR.sys_updated_by.toString(),
                action: xmlGR.action.toString(),
                scope: xmlGR.application.getDisplayValue(),
                update_set_name: xmlGR.update_set.getDisplayValue()
            };

            var xmlUpdateSetScope = xmlGR.update_set.application.toString();
            var xmlRecordScope = xmlGR.application.toString();

            if (xmlGR.action == "DELETE") {
                result.deletes.push(rec);
            } else if (xmlRecordScope != xmlUpdateSetScope) {
                result.cross.push(rec);
            }
        }

        return JSON.stringify(result);
    },

    type: 'reviewUpdateSetAJAX'
});
\`\`\`

---

### Final Result

Clicking the UI Action opens a modal showing:

<div class="blog-image">
<img src="images/b10img1.png" alt="Weather Widget Output in Service Portal" />
</div>
<div class="blog-image">
<img src="images/b10img2.png" alt="Weather Widget Output in Service Portal" />
</div>
<div class="blog-image">
<img src="images/b10img3.png" alt="Weather Widget Output in Service Portal" />
</div>

- DELETE Records Tab
- CROSS SCOPED Records Tab
- Optional inclusion of child update sets
- Record counts per category

---

© 2026 Rohan Aditya
`,
    },
    {
        id: '1011',
        title: 'Copying Incident Fields When Creating Change Request',
        category: 'Use Case',
        excerpt: 'Customize the Create Change process in UI Builder to automatically copy Incident fields into the new Change Request.',
        tags: ['Incident', 'Change Management', 'UI Builder', 'Incident to Change'],
        date: '2026-03-11',
        views: 210,
        created: '2026-03-11T10:00:00Z',
        content: `
**Author: Rohan Aditya**

### Use Case

When creating a Change Request from an Incident, it is often useful to automatically copy relevant field values from the Incident to the Change.

ServiceNow already copies some OOB task fields, but organizations usually need additional fields or custom logic.

Instead of manually populating fields every time… we customize the Create Change page in UI Builder.

---

### Step 1: Duplicate the OOB Create Change Request Page

Navigate to UI Builder, search for "Service operations workspace" and locate the page.

**create-change-request-page**

<div class="blog-image">
<img src="images/b11img1.png" alt="Create Change Request Page" />
</div>

Click on it to open this page in Editor.
On Top middle you can find "Settings" click on it.

<div class="blog-image">
<img src="images/b11img2.png" alt="Create Change Request Page in Editor" />
</div>

Give less order value than OOB page to make sure it loads first and than OOB Page.

<div class="blog-image">
<img src="images/b11img3.png" alt="Create Change Request Page in Editor" />
</div>

---

### Now we have Two Scenarios

1. Copying **Task table fields**
2. Copying **Custom fields**

---

## Copying Task Fields

ServiceNow already copies certain task fields when creating a Change.

Open the new page in Editor and navigate to,

**Client State Parameters → taskFields**

<div class="blog-image">
<img src="images/b11img4.png" alt="Client State Parameters" />
</div>

<div class="blog-image">
<img src="images/b11img5.png" alt="taskFields" />
</div>


Verify the fields in the **Initial Value** property.

Example:

\`\`\`
short_description,description,cmdb_ci,priority,assignment_group
\`\`\`

These fields are automatically copied from **Incident → Change Request**.

To copy additional **task fields**, simply add them to this list.

Example:

\`\`\`
short_description,description,cmdb_ci,priority,assignment_group,impact,urgency
\`\`\`

Now these fields will also be copied automatically.

---

## Copying Custom Fields

There are **two possibilities** when dealing with custom fields.

### Case 1: Custom Field Exists on Task Table

If the custom field:

- Belongs to the **task table**
- Exists on both **Incident and Change Request**

Then simply add it to **taskFields**.

Example:

\`\`\`
short_description,description,u_business_service
\`\`\`

The field will automatically copy.

---

### Case 2: Custom Fields Are Different

If fields are **not shared between tables**, we must modify the client script.

Navigate to:

**Client Scripts → Additional Query data from Task**

<div class="blog-image">
<img src="images/b11img6.png" alt="Additional Query data from Task" />
</div>

This script builds an **encoded query** that populates fields in the Change Request.

---

### Client Script Logic

The script:

1. Fetches the source record (Incident)
2. Builds an encoded query
3. Maps values into the Change form.

### OOB UX Client Script

**api.state.taskFields** contains the list of fields to copy.
With these fields defined, the script iterates through them, checks if they have values in the Incident record, and constructs an encoded query string.
\`\`\`javascript
/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!api.context.props.table || !api.context.props.sysid)
        return;

    const results = api.data[event.elementId].output.data.GlideRecord_Query[api.context.props.table]._results;
    if (results.length < 1)
        return;

    const record = results[0];
    let query = api.state.additionalQuery || '';
    const queryParams = [];
    const matchedGroups = query.match(/(\w*)=/ig)
    if (Array.isArray(matchedGroups))
        matchedGroups.map((param) => { queryParams.push(param.replace('=', '')); });

    // params passed in must not be overridden, so remove them
    const taskFields = api.state.taskFields.split(',').filter((field) => { return !queryParams.includes(field); });
    taskFields.map((field) => {
        const value = record[field].value;
        if (!value)
            return;

        if (query !== '')
            query += '^' + field + '=' + value;
        else
            query = field + '=' + value;
    });
    api.setState('additionalQuery', query);
}
\`\`\`

---

### Custom Mapping Example

Sometimes fields must be **mapped differently**.

Example:
**u_incident_field → u_change_field**

Example logic:

\`\`\`javascript
if (record.u_incident_field && record.u_incident_field.value) {
    query += '^u_change_field=' + record.u_incident_field.value;
}

\`\`\`
Then our new UX Client Script would look like this:

\`\`\`javascript
/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    if (!api.context.props.table || !api.context.props.sysid)
        return;

    const results = api.data[event.elementId].output.data.GlideRecord_Query[api.context.props.table]._results;
    if (results.length < 1)
        return;

    const record = results[0];
    let query = api.state.additionalQuery || '';
    const queryParams = [];
    const matchedGroups = query.match(/(\w*)=/ig)
    if (Array.isArray(matchedGroups))
        matchedGroups.map((param) => { queryParams.push(param.replace('=', '')); });

    // params passed in must not be overridden, so remove them
    const taskFields = api.state.taskFields.split(',').filter((field) => { return !queryParams.includes(field); });
    taskFields.map((field) => {
        const value = record[field].value;
        if (!value)
            return;

        if (query !== '')
            query += '^' + field + '=' + value;
        else
            query = field + '=' + value;
    });

    if (record.u_incident_field && record.u_incident_field.value) {
        query += '^u_change_field=' + record.u_incident_field.value;
    }
        
    api.setState('additionalQuery', query);
}
\`\`\`

This ensures the correct fields are populated in the Change Request.

---

### Final Result

When clicking **Create Change from Incident**:

- Task fields are copied automatically
- Custom fields can be mapped
- Additional logic can be applied

This allows:

- Faster Change creation
- Consistent data transfer
- Less manual work for Agents

---

© 2026 Rohan Aditya
`,

    }
];

// Function to get articles (from localStorage or default data)
function getArticles() {
    const stored = localStorage.getItem('blog_articles');
    if (stored) {
        return JSON.parse(stored);
    }
    // First time - save default data to localStorage
    localStorage.setItem('blog_articles', JSON.stringify(articlesData));
    return articlesData;
}

// Function to save articles
function saveArticles(articles) {
    localStorage.setItem('blog_articles', JSON.stringify(articles));
}

// Function to get single article by ID
function getArticleById(id) {
    const articles = getArticles();
    return articles.find(a => a.id === id);
}

// Function to update article views
function incrementViews(id) {
    const articles = getArticles();
    const article = articles.find(a => a.id === id);
    if (article) {
        article.views = (article.views || 0) + 1;
        saveArticles(articles);
    }
}
function forceDownload() {
    const url = "https://raw.githubusercontent.com/aytid/servicenow/main/Weather-API-Widget.xml";
    fetch(url)
        .then(res => res.blob())
        .then(blob => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "Weather-API-Widget.xml";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        })
        .catch(() => alert("Download failed. Please check the file URL."));
}