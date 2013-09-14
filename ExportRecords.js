/**
 * Created by JetBrains WebStorm.
 * User: Joshua McDonald joshuamcdonald69124@gmail.com
 * www.learnsomethings.com
 * Date: 9/12/13
 * To change this template use File | Settings | File Templates.
 */
Ext.define('Ext.ux.ExportRecords', {
    extend      : 'Ext.AbstractPlugin',
    alias       : 'plugin.exportrecords',

    /*
        Will create a context menu with a download
        button if this is set to 'context' or add a
        button to a toolbar if it is set to 'top'
    */

    downloadButton   : 'context',

    init    : function(component){
        var me = this;
        component.selectedRecords  = [];


        component.on('select', me.onRowSelect, component);
        component.on('deselect', me.onRowDeselect, component);


        if(me.downloadButton == 'context'){
            me.contextMenu = Ext.create('Ext.menu.Menu', {
                width   : 250,
                items   :[
                    {
                        xtype   :   'button',
                        text    :   'Export Selected Records',
                        listeners: {
                            click: {
                                fn      : me.onExportToExcel,
                                scope   : component
                            }
                        }
                    }
                ]
            });

            component.on('itemcontextmenu', me.onRightExportExcel,this);

        } else {
            /*
                Does a toolbar exist?
                If so add the button to the existing tbar, if not
                create a tbar and then add the button.
            */
            if (component.getDockedItems('toolbar[dock="top"]').length === 0){
                component.addDocked({
                    xtype   : 'toolbar',
                    dock    : 'top',
                    items: [{
                        xtype   :   'button',
                        text    :   'Export Selected Records',
                        listeners: {
                            click: {
                                fn      : me.onExportToExcel,
                                scope   : component
                            }
                        }
                    }]
                });
            } else {
                component.getDockedItems('toolbar[dock="top"]').insert(0, {
                    xtype   :   'button',
                    text    :   'Export Selected Records',
                    listeners: {
                        click: {
                            fn      : me.onExportToExcel,
                            scope   : component
                        }
                    }
                })
            }
        }

        /*
            Whoa! this grid has paging enabled, go ahead
            and make sure to remember the selections across
            pages for the print function.
        */
        if(component.down('pagingtoolbar') != null){
            // Is there a paging toolbar?
            component.relayEvents(component.down('pagingtoolbar'), ['change'], 'page');
            component.on('pagechange', me.onPageChange, component);
        }


    },

    onPageChange: function(pgtb, pageData){
        var me              = this,

            selectionModel  = me.getSelectionModel(),
            /*
             Beacuse the records in the page that you see have a row index that
             always starts with 0
             */
            subtractive     = (pageData.currentPage - 1 ) * me.store.pageSize,
            /*
             Users probably would not like to see Displaying 0 - 24 of 56 records
             in the paging toolbar so you have to account for the fact that the
             toRecord of pagedata will be one over unless the number of records displayed
             is less than the original page size.
             */
            finalIndex      = (me.getStore().getCount() < me.store.pageSize) ? pageData.toRecord :(pageData.toRecord -1 ),

            startIndex      = (pageData.fromRecord - 1);
        /* Make sure you remove the empty values */
        Ext.Array.clean(me.selectedRecords);
        /* Dedupe the array */
        Ext.Array.unique(me.selectedRecords);

        for (var i = 0; i < me.selectedRecords.length; i++){
            /*
             Make sure that you check if the current index falls in the visible indices
             on the current page otherwise you will get an error when trying
             to select an index that is out of range (but you would never know it,
             as it will not tell you what the error is)
             */
            if(me.selectedRecords[i].index >= startIndex && me.selectedRecords[i].index <= finalIndex){
                selectionModel.select((me.selectedRecords[i].index - subtractive), true,true);
            }
        }
    },

    onRowSelect : function(grid, record){
        Ext.Array.push(this.selectedRecords,record);
    },

    onRowDeselect   : function(grid, record){
        Ext.Array.remove(this.selectedRecords,record);
    },

    onRightExportExcel: function(grid,record, item, index, e){
        e.preventDefault();
        this.contextMenu.showAt(Ext.EventObject.getXY());
    },


    onExportToExcel: function(){
        var me              = this,
            csvContent      = '',
            /*
             Does this browser support the download attribute
             in HTML 5, if so create a comma seperated value
             file from the selected records / if not create
             an old school HTML table that comes up in a
             popup window allowing the users to copy and paste
             the rows.
             */
            noCsvSupport     = ( 'download' in document.createElement('a') ) ? false : true,
            sdelimiter      = noCsvSupport ? "<td>"   : "",
            edelimiter      = noCsvSupport ? "</td>"  : ",",
            snewLine        = noCsvSupport ? "<tr>"   : "",
            enewLine        = noCsvSupport ? "</tr>"  : "\r\n",
            printableValue  = '';

        csvContent += snewLine;

        /* Get the column headers from the store dataIndex */
        Ext.Object.each(me.selectedRecords[0].data, function(key) {
            csvContent += sdelimiter +  key + edelimiter;
        });

        csvContent += enewLine;
        /*
         Loop through the selected records array and change the JSON
         object to teh appropriate format.
         */
        for (var i = 0; i < me.selectedRecords.length; i++){
            /* Put the record object in somma seperated format */
            csvContent += snewLine;
            Ext.Object.each(me.selectedRecords[i].data, function(key, value) {
                printableValue = ((noCsvSupport) && value == '') ? '&nbsp;'  : value;
                printableValue = String(printableValue).replace(/,/g , "");
                printableValue = String(printableValue).replace(/(\r\n|\n|\r)/gm,"");
                csvContent += sdelimiter +  printableValue + edelimiter;
            });
            csvContent += enewLine;
        }

        if('download' in document.createElement('a')){
            /*
             This is the code that produces the CSV file and downloads it
             to the users computer
             */
            var link = document.createElement("a");
            link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURI(csvContent));
            link.setAttribute("download", "my_data.csv");
            link.click();
        } else {
            /*
             The values below get printed into a blank window for
             the luddites.
             */
            var newWin = open('windowName',"_blank");
            newWin.document.write('<table border=1>' + csvContent + '</table>');
        }
    }
});