extjs4DownloadGridCSVPlugin
===========================

Allow users to download an extjs grid easily in CSV format client side with this simple plugin

OK, you have created a really nice app, that contains a lot of data, and now the customer wants to download selected records into a comma separated value spreadsheet. You don't want to go back to the server, run the query, and be bothered with sending a list of id's that the user has selected, that would be so 2010, and it would, well, take some time, and your users are particularly impatient! You are on top of the latest trends and have heard of the download attribute of the a (link) tag. This attribute lets you specify a filename and pops up a 'save as' prompt on the client machine. No more server side requerying and transferring just for the sake of creating a file save dialog, I mean haven't you already done enough getting the data into that grid in the first place? 

There are two problems hidden in this task, first - what to do with old browsers, and second what happens if we need to implement a paging grid. Let me address both by stepping through the plugin code piece by piece:

1) Where do you want the download records button to appear, the default is to create a context (right click) menu and show the user a button indicating they can download the records, however, for those users that just need to see the button you can pass

[javascript] 
downloadButton   : 'top',
[/javascript]

in the grid and it should create or append a button to a toolbar at the top of the grid.

2) I know what you are thinking, 'I'm using paging, my users want to pick and choose records across multiple pages!'. Don't worry I had the same idea, in the init function you will see that an array named selectedRecords is created and that listeners are set on the 'select' and  'deselect' events of the grid. These two listeners point to functions that add and remove selected records to the array. A third listener waits patiently for page changes and then re-selects the records that the user had previously selected on the page (hey it's an added bonus!). The function onPageChange handles all of the reselecting.

3) Ok, this all makes sense but what about the users that are stuck on old browsers? The magic of the new download attribute has been lost on some browsers, i.e IE, so for those users a window with an old school HTML table is popped up allowing them to just cut and paste the selected records, or print the page.

Download the plugin here :  https://github.com/jmcdonald69124/extjs4DownloadGridCSVPlugin 

Save the plugin to your Extjs ux folder.

Make sure you add the following to the required files:

[javascript]
Ext.require([
    'Ext.ux.ExportRecords',
 ]);
[/javascript]

Add the plugin to a grid like this:

[javascript]
plugins :[{
            ptype           :   'exportrecords',
            downloadButton  : 'top'
        }],

[/javascript]

