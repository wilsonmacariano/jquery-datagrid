(function( $ ){

    var alerts = {
        missingData : "Missing data!",
        missingMetadata : "Missing metadata!"
    }

    var navigator = {
        findNextEditableTableCell : function( tableCell ) {
            //            var metadata = $($(tableCell).parents('table')[0]).data('metadata');
            //            var tableBody = $(tableCell).parents('tbody')[0];
            var metadata = $(tableCell).findFirstParent('table').data('metadata');
            var tableBody = $(tableCell).findFirstParent('tbody')[0];

            var nextTableCell = tableCell;
            do {
                if ( nextTableCell.nextSibling ) {
                    nextTableCell = nextTableCell.nextSibling;
                } else {
                    //                    var tableRow = $(nextTableCell).parents('tr')[0];
                    var tableRow = $(nextTableCell).findFirstParent('tr')[0];
                    if ( tableRow.sectionRowIndex + 1 < tableBody.rows.length  ) {
                        nextTableCell = tableBody.rows[tableRow.sectionRowIndex + 1].cells[0];
                    } else {
                        nextTableCell = null;
                    }
                }
            } while ( nextTableCell && ( !nextTableCell.fieldName || !metadata[nextTableCell.fieldName].editable) );

            return nextTableCell;

        },
        findPreviousEditableTableCell : function(tableCell) {
            //            var metadata = $($(tableCell).parents('table')[0]).data('metadata');
            //            var tableBody = $(tableCell).parents('tbody')[0];
            var metadata = $(tableCell).findFirstParent('table').data('metadata');
            var tableBody = $(tableCell).findFirstParent('tbody')[0];

            var previousTableCell = tableCell;
            do {
                if ( previousTableCell.previousSibling ) {
                    previousTableCell = previousTableCell.previousSibling;
                } else {
                    //                    var tableRow = $(previousTableCell).parents('tr')[0];
                    var tableRow = $(previousTableCell).findFirstParent('tr')[0];
                    if ( tableRow.sectionRowIndex - 1 >= 0  ) {
                        var cellLength = tableBody.rows[tableRow.sectionRowIndex - 1].cells.length;
                        previousTableCell = tableBody.rows[tableRow.sectionRowIndex - 1].cells[cellLength-1];
                    } else {
                        previousTableCell = null;
                    }
                }
            } while ( previousTableCell && ( !previousTableCell.fieldName || !metadata[previousTableCell.fieldName].editable) );

            return previousTableCell;
        },
        findLastSortedHeader : function(tableHead) {
            for ( var i = 0 ; i < tableHead.rows[0].cells.length ; ++i ) {
                if ( tableHead.rows[0].cells[i].className.search(/rsorted/i) > -1 ) {
                    tableHead.rows[0].cells[i].className = tableHead.rows[0].cells[i].className.replace("rsorted", "");
                    break;
                } else if ( tableHead.rows[0].cells[i].className.search(/sorted/i) > -1 ) {
                    tableHead.rows[0].cells[i].className = tableHead.rows[0].cells[i].className.replace("sorted", "");
                    break;
                }
            }
        }
    }

    var manipulator = {
        turnCellEditable : function( tableCell ) {

            // get metadata from table
            //            var metadata = $($(tableCell).parents('table')[0]).data('metadata');
            var metadata = $(tableCell).findFirstParent('table').data('metadata');

            // if this field is not editable, stop 'propagation'
            var fieldExists = tableCell.fieldName == undefined ? false : true;
            if ( !fieldExists ) {
                return; 
            }
            if ( !( metadata[tableCell.fieldName].editable ) ) {
                return;
            }

            //            var tableRow = $(tableCell).parents('tr')[0];
            var tableRow = $(tableCell).findFirstParent('tr')[0];

            // Clean the tableCell
            $(tableCell).empty();

            // Build proper input object
            var input = manipulator.builderProperInputElement( tableCell );

            // Set the default events for input object
            // KeyDown Session
            manipulator.setDefaultKeydown(input);

            // Oblur
            if (metadata[tableCell.fieldName].type.name == "date") {
                $(input).blur(function() {
                    if ( !$(this).hasClass("hasDatepicker") ) {
                        manipulator.turnOffCellEditable( tableCell );
                    }
                });
            } else {
                $(input).blur(function() {
                    manipulator.turnOffCellEditable( tableCell );
                });
            }

            // Onchange
            $(input).change( function( event ) {
                //                var metadata = $($(tableCell).parents('table')[0]).data('metadata');
                //                var tableRow = $( event.target ).parents('tr')[0];
                var metadata = $( tableCell ).findFirstParent('table').data('metadata');
                var tableRow = $( event.target ).findFirstParent('tr')[0];

                var model;
                if ( tableRow.modified ) {
                    model = tableRow.modified;
                } else {
                    model = tableRow.model;
                }

                var changedData = { } ;
                for ( var key in model ) {
                    changedData[key] = model[key];
                    if ( key == tableCell.fieldName ) {
                        if ( metadata[tableCell.fieldName].type.name == "combobox" ) {
                            var selected = this.options[this.selectedIndex];
                            changedData[key] = {
                                id: selected.value,
                                description: selected.text
                            };
                        } else if ( metadata[tableCell.fieldName].type.name == "combobox-yesno" ) {
                            var selected = this.options[this.selectedIndex];
                            if ( selected.value == "true" ) {
                                changedData[key] = true;
                            } else {
                                changedData[key] = false;
                            }
                        }
                    }
                }
                tableRow.modified = changedData;
            });

            // Onfocus
            $(input).focus( function( ) {
                if ($(tableCell).hasClass("focus") ) {//
                    $(tableCell).removeClass("focus");
                    $(this).focus();
                }
            });
            //

            $(tableRow).addClass("ui-selected-row");
            $(tableCell).addClass("ui-selected-cell focus");

            // Append to the cell
            $(tableCell).append(input);
            $(input).focus();

        },
        removeTableRow : function(tableRow) {
            $('#removeDialog').dialog({
                title: "Information",
                modal: true,
                buttons : {
                    Yes : function() {
                        var tableParent = $(tableRow).findFirstParent('table');
                        $(tableRow).remove();
                        if ( tableParent && tableParent.length > 0 )
                            manipulator.applyEvenAndOdd(tableParent[0]);
                        $(this).dialog("close");
                    },
                    No : function() {
                        $(this).dialog("close");
                    }
                }
            });
        },
        applyEvenAndOdd : function(table) {
            var tbody = $(table).find('tbody')[0];
            for ( var j = 0 ; j < tbody.rows.length ; ++j ) {

                if ( $(tbody.rows[j]).hasClass('odd') ) {
                    $(tbody.rows[j]).removeClass('odd');
                } else if ( $(tbody.rows[j]).hasClass('even') ) {
                    $(tbody.rows[j]).removeClass('even');
                }

                if ( j % 2 ) {
                    $(tbody.rows[j]).addClass('even');
                } else {
                    $(tbody.rows[j]).addClass('odd');
                }
            }
        },
        turnOffCellEditable : function( tableCell ) {
            //            var metadata = $($(tableCell).parents('table')[0]).data('metadata');
            //            var tableRow = $(tableCell).parents('tr')[0];
            var metadata = $(tableCell).findFirstParent('table').data('metadata');
            var tableRow = $(tableCell).findFirstParent('tr')[0];

            $(tableCell).empty();

            var model = tableRow.modified ? tableRow.modified : tableRow.model;

            var cellContent;
            if ( metadata[tableCell.fieldName].type.name == "string" ||
                metadata[tableCell.fieldName].type.name == "number" ||
                metadata[tableCell.fieldName].type.name == "date" ) {
                cellContent = model[tableCell.fieldName];
                tableCell.innerHTML = cellContent;
            } else if ( metadata[tableCell.fieldName].type.name == "combobox" ) {
                cellContent = model[tableCell.fieldName].description;
                tableCell.innerHTML = cellContent;
            } else if ( metadata[tableCell.fieldName].type.name == "combobox-yesno" ) {
                var value = model[tableCell.fieldName];
                cellContent = model[tableCell.fieldName] ? "Yes" : "No";
                tableCell.innerHTML = cellContent;
            } else if ( metadata[tableCell.fieldName].type.name == "checkbox" ) {
                cellContent = builder.buildSpanCheckbox(null, null, model[tableCell.fieldName]);
                tableCell.appendChild(cellContent);
            } else if ( metadata[tableCell.fieldName].type.name == "currency" ) {
                cellContent = model[tableCell.fieldName];
                tableCell.innerHTML = converter.decimalParaMoedaReal(cellContent);
            }

            $(tableCell).removeClass("ui-selected-cell");
            $(tableRow).removeClass("ui-selected-row");

        },
        build : function( settings ) {
            $(settings.self).append(manipulator.buildHeaders( settings ));
            $(settings.self).append(manipulator.buildBody( settings ));
        },
        buildHeaders : function( settings ) {
            var table = settings.self;
            var rowsRemovable = settings.rowsRemovable;
            var metadata = settings.metadata;

            var className;
            switch ( settings.headerStyle ) {
                case 1 :
                    className = "ui-widget-header ui-corner-all";
                    break;
                case 2 :
                    className = "ui-state-active ui-widget-header ui-corner-all";
                    break;
                    className = null;
            }
            var thead = builder.buildTableHead(null, className, null);
            var thead_tr = builder.buildTableRow();

            for ( var field in metadata ) {
                $(table).append( builder.buildTableCol( null, "col-" + metadata[field].fieldName ) );

                var tableHeader = builder.buildTableHeader(null, null, metadata[field].columnName , metadata[field].sortable );
                tableHeader.fieldName = metadata[field].fieldName;

                $(thead_tr).append(tableHeader);
            }

            if ( rowsRemovable ) {
                $(thead_tr).append(builder.buildTableHeader());
            }

            $(thead).append(thead_tr);

            return thead;
        },
        buildBody : function( settings ) {
            var metadata = settings.metadata;
            var data = settings.data;
            var rowsRemovable = settings.rowsRemovable;
            var tbody = builder.buildTableBody();

            for ( var j = 0; j < data.length; ++j ) {

                var tableRow = manipulator.createRow(metadata, data[j], rowsRemovable);

                if ( j % 2 ) {
                    tableRow.className = "even";
                }
                else {
                    tableRow.className = "odd";
                }

                tableRow.model = data[j];
                tbody.appendChild(tableRow);
            }

            return tbody;
        },
        createRow : function(metadata, data, rowsRemovable) {
            var tableRow = builder.buildTableRow();
            for ( var field in metadata ) {
                var dataToGo = data ? data[field] : null;
                var tableCell = builder.buildSpecializedTableCell( metadata[field] , dataToGo );
                tableCell.className = "td-" + field;
                tableCell.fieldName = field;
                $(tableRow).append(tableCell);
            }
            if ( rowsRemovable ) {
                var removable = builder.buildTableCell();
                var span = builder.buildSpan();
                span.className = "ui-icon ui-icon-trash removable";
                removable.appendChild(span);
                $(tableRow).append(removable);
            }
            return tableRow;
        },
        setDefaultKeydown : function(input) {

            $(input).keydown(function(event) {

                var keynum = event.keyCode;

                //                var tableCell = $(this).parents('td')[0];
                var tableCell = $(this).findFirstParent('td')[0];

                //                var metadata = $($(tableCell).parents('table')[0]).data('metadata');
                //                var tableRow = $( event.target ).parents('tr')[0];
                //                var tbody = $(tableRow).parents('tbody')[0];
                var metadata = $( tableCell ).findFirstParent('table').data('metadata');
                var tableRow = $( event.target ).findFirstParent('tr')[0];
                var tbody = $( tableRow ).findFirstParent('tbody')[0];

                if ( event.shiftKey && keynum == 9 ) { // Shift + Tab

                    if ( $(this).hasClass("hasDatepicker") ) {
                        event.stopPropagation();
                        return;
                    }

                    var previousTableCell = navigator.findPreviousEditableTableCell(tableCell);

                    if ( previousTableCell ) {
                        manipulator.turnOffCellEditable(tableCell);
                        manipulator.turnCellEditable(previousTableCell);
                    }

                    event.preventDefault();
                } else if ( keynum == 9 ) {   // Tab

                    if ( $(this).hasClass("hasDatepicker") ) {
                        event.stopPropagation();
                        return;
                    }

                    var nextTableCell = navigator.findNextEditableTableCell(tableCell);

                    if ( nextTableCell ) {
                        manipulator.turnOffCellEditable(tableCell);
                        manipulator.turnCellEditable(nextTableCell);
                    }

                    event.preventDefault();
                } else if ( keynum == 13 ) {   // Enter
                    var model;
                    if ( tableRow.modified ) {
                        model = tableRow.modified;
                    } else {
                        model = tableRow.model;
                    }

                    var changedData = { } ;
                    for ( var key in model ) {
                        changedData[key] = model[key];
                        if ( key == tableCell.fieldName ) {
                            if ( metadata[tableCell.fieldName].type.name == "currency" ) {
                                changedData[key] = converter.moedaRealParaDecimal(this.value);
                            } else if ( metadata[tableCell.fieldName].type.name == "combobox" ) {
                                var selected = this.options[this.selectedIndex];
                                changedData[key] = {
                                    id: selected.value,
                                    description: selected.text
                                };
                            }
                            else if ( metadata[tableCell.fieldName].type.name == "combobox-yesno" ) {
                                var selected = this.options[this.selectedIndex];
                                if ( selected.value == "true" ) {
                                    changedData[key] = true;
                                } else {
                                    changedData[key] = false;
                                }

                            } else {
                                changedData[key] = this.value;
                            }
                        }
                    }
                    tableRow.modified = changedData;

                }

                if ( metadata[tableCell.fieldName].type.name != "combobox" &&
                    metadata[tableCell.fieldName].type.name != "combobox-yesno" ) {
                    if ( keynum == 40 ) {  // Down Arrow

                        if ( tableRow.sectionRowIndex + 1 > tbody.rows.length - 1 ) {
                            return;
                        }

                        var tableRowBelow = tbody.rows[tableRow.sectionRowIndex + 1]

                        manipulator.turnOffCellEditable(tableCell);
                        manipulator.turnCellEditable(tableRowBelow.cells[tableCell.cellIndex]);

                        event.preventDefault();

                    } else if ( keynum == 38 ) {  // Up Arrow
                        if ( tableRow.sectionRowIndex - 1 < 0 ) {
                            return;
                        }

                        var tableRowAbove = tbody.rows[tableRow.sectionRowIndex - 1];
                        manipulator.turnOffCellEditable(tableCell);
                        manipulator.turnCellEditable(tableRowAbove.cells[tableCell.cellIndex]);

                        event.preventDefault();

                    }
                }

            });

            $(input).focus( function(event) {
                if  ( $(input).hasClass("focus") ) {
                    $(input).removeClass("focus");
                    $(this).focus();
                }
            });
        },
        setOnChange : function( input, tableCell ) {

            $(input).change(function( event ) {
                //                var metadata = $($(tableCell).parents('table')[0]).data('metadata');
                //                var tableRow = $( event.target ).parents('tr')[0];
                var metadata = $( tableCell ).findFirstParent('table').data('metadata');
                var tableRow = $( event.target ).findFirstParent('tr')[0];

                var model;
                if ( tableRow.modified ) {
                    model = tableRow.modified;
                } else {
                    model = tableRow.model;
                }

                var changedData = { } ;
                for ( var key in model ) {
                    changedData[key] = model[key];
                    if ( key == tableCell.fieldName ) {
                        if ( metadata[tableCell.fieldName].type.name == "combobox" ) {
                            var selected = this.options[this.selectedIndex];
                            changedData[key] = {
                                id: selected.value,
                                description: selected.text
                            };
                        } else if ( metadata[tableCell.fieldName].type.name == "combobox-yesno" ) {
                            var selected = this.options[this.selectedIndex];
                            if ( selected.value == "true" ) {
                                changedData[key] = true;
                            } else {
                                changedData[key] = false;
                            }

                        }
                        else {
                            changedData[key] = this.value;
                        }
                    }
                }
                tableRow.modified = changedData;
            });

        },
        builderProperInputElement : function( tableCell ) {

            //            var metadata = $($(tableCell).parents('table')[0]).data('metadata');
            //            var tableRow = $(tableCell).parents('tr')[0];
            var metadata = $(tableCell).findFirstParent('table').data('metadata');
            var tableRow = $(tableCell).findFirstParent('tr')[0];
            var model = tableRow.modified ? tableRow.modified : tableRow.model;
            var type = metadata[tableCell.fieldName].type;

            if ( type.name == "string" || type.name == "number" ) {

                return builder.buildInputText(null, null, model[tableCell.fieldName]);

            } else if (type.name == "currency") {

                var input = builder.buildInputText(null, null, converter.decimalParaMoedaReal(model[tableCell.fieldName]));
                $(input).maskMoney({
                    symbol:"R$",
                    decimal:",",
                    thousands:"."
                });

                return input;
            } else if ( type.name == "date" ) {

                var inputDate = builder.buildInputText(null, null, model[tableCell.fieldName]);
                //$(inputDate).datepicker();
                $(inputDate).click( function() {
                    $(this).datepicker( {
                        dateFormat : 'dd/mm/yy',
                        onSelect: function(dateText, inst) {
                            //                            var tableCell = $(this).parents('td')[0];
                            //                            var tableRow = $(this).parents('tr')[0];
                            var tableCell = $(this).findFirstParent('td')[0];
                            var tableRow = $(this).findFirstParent('tr')[0];
                            var changedData = { } ;
                            for ( var key in model ) {
                                changedData[key] = model[key];
                                if ( key == tableCell.fieldName ) {
                                    changedData[key] = this.value;
                                }
                            }
                            tableRow.modified = changedData;
                            $(this).removeClass("hasDatepicker");
                        },
                        onClose: function(dateText, inst) {
                            var tableCell
                            if (this) {
                                //                                tableCell = $(this).parents('td')[0];
                                tableCell = $(this).findFirstParent('td')[0];
                                manipulator.turnOffCellEditable(tableCell);
                            }
                        }
                    } );
                    $(this).focus();
                } );

                return inputDate;

            }
            else if ( type.name == "combobox" ) {

                var relatedTableName = metadata[tableCell.fieldName].type.relatedTable;
                //                var relatedTables = $($(tableCell).parents('table')[0]).data('relatedTables');
                var relatedTables = $(tableCell).findFirstParent('table').data('relatedTables');
                var relatedTable = relatedTables[relatedTableName];
                var select = builder.buildSelect();
                var selectedIndex = 0;

                for ( var i = 0; i < relatedTable.length ; ++i )  {
                    if ( relatedTable[i].id == model[tableCell.fieldName].id ) {
                        selectedIndex = i;
                    }
                    try {
                        select.add(new Option(relatedTable[i].description, relatedTable[i].id), null);
                    } catch( ex ) {
                        select.add(new Option(relatedTable[i].description, relatedTable[i].id));
                    }
                }
                select.selectedIndex = selectedIndex;
                return select;

            } else if ( type.name == "combobox-yesno" ) {
                var selectYesNo = builder.buildSelect();

                var yes = "Yes";
                var no = "No";

                try {
                    selectYesNo.add(new Option(no, false), null);
                } catch( ex ) {
                    selectYesNo.add(new Option(no, false));
                }

                try {
                    selectYesNo.add(new Option(yes, true), null);
                } catch( ex ) {
                    selectYesNo.add(new Option(yes, true));
                }

                if ( model[tableCell.fieldName] == true ) {
                    selectYesNo.selectedIndex = 1; // No index
                } else {
                    selectYesNo.selectedIndex = 0; // Yes index
                }

                return selectYesNo;
            }
            else { // Checkbox
                return builder.buildCheckbox( null, null, model[tableCell.fieldName] );
            }

        },
        setInputData : function(  ) {

        }

    }

    var builder = {
        buildTableCol : function( id, className ) {
            var col = document.createElement("col");
            if ( id ) {
                col.id = id;
            }
            if ( className ) {
                col.className = className;
            }
            return col;
        },
        buildTableCell : function( id, className, innerHTML ) {
            var td = document.createElement("td");
            if ( id ) {
                td.id = id;
            }
            if ( className ) {
                td.className = className;
            }
            if ( innerHTML ) {
                if ( innerHTML && typeof innerHTML =="object" ) {
                    td.appendChild(innerHTML);
                } else {
                    td.innerHTML = innerHTML;
                }
            }
            return td;
        },
        buildSelect : function( id , className ) {
            var select = document.createElement("select");
            select.focused = false;
            if ( id ) {
                select.id = id;
            }
            if ( className ) {
                select.className = className;
            }
            return select;
        },
        buildTableHead : function(id, className, innerHTML) {
            var thead = document.createElement("thead");
            if ( id ) {
                thead.id = id;
            }
            if ( className ) {
                thead.className = className;
            }
            if ( innerHTML ) {
                if ( typeof innerHTML =="object" ) {
                    thead.appendChild(innerHTML);
                } else {
                    thead.innerHTML = innerHTML;
                }
            }
            return thead;
        },
        buildTableHeader : function(id, className, innerHTML, sortable) {
            var th = document.createElement("th");
            if ( id ) {
                th.id = id;
            }
            if ( className ) {
                th.className = className;
            }
            if ( innerHTML ) {
                if ( typeof innerHTML == "object" ) {
                    th.appendChild(innerHTML);
                } else {
                    th.innerHTML = innerHTML;
                }
            }
            if ( sortable ) {
                var spanIconDoubleArrow = document.createElement("span");
                spanIconDoubleArrow.className = "ui-icon ui-icon-triangle-2-n-s";

                var spanIconDownArrow = document.createElement("span");
                spanIconDownArrow.className = "ui-icon ui-icon-triangle-1-s";

                var spanIconUpArrow = document.createElement("span");
                spanIconUpArrow.className = "ui-icon ui-icon-triangle-1-n";

                th.appendChild(spanIconDoubleArrow);
                th.appendChild(spanIconDownArrow);
                th.appendChild(spanIconUpArrow);
            }
            return th;
        },
        buildTableBody : function(id, className) {
            var tbody = document.createElement("tbody");
            if ( className ) {
                tbody.className = className;
            }
            return tbody;
        },
        buildTableRow : function(id, className, innerHTML) {
            var tr = document.createElement("tr");
            if ( id ) {
                tr.id = id;
            }
            if ( className ) {
                tr.className = className;
            }
            if ( innerHTML && typeof innerHTML == "object" ) {
                tr.appendChild(innerHTML);
            }
            return tr;
        },
        buildInputText : function(id, className, value, maxLength) {
            var inputText = document.createElement("input");
            inputText.type = "text";
            if ( maxLength ) {
                inputText.maxLength = maxLength;
            }
            if ( id && id.length ) {
                inputText.id = id;
            }
            if ( className && className.length ) {
                inputText.className = className;
            }
            if ( typeof value == "number" ) {
                inputText.value = value;
            } else if ( typeof value == "string" ) {
                inputText.value = value;
            }
            return inputText;
        },
        buildCheckbox : function( id, className, value , disabled ) {
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            if ( id && id.length ) {
                checkbox.id = id;
            }
            if ( className && className.length ) {
                checkbox.className = className;
            }
            if ( value ) {
                checkbox.checked = value;
            }
            if ( disabled ) {
                checkbox.disabled = true;
            }
            return checkbox;
        },
        buildSpanCheckbox : function( id, className, value , disabled ) {
            var checkbox = document.createElement("span");
            if ( id && id.length ) {
                checkbox.id = id;
            }
            if ( className && className.length ) {
                checkbox.className =+ className;
            }
            if ( value ) {
                checkbox.checked = value;
                checkbox.className = "ui-checkbox ui-checkbox-on";
            } else {
                checkbox.className = "ui-checkbox ui-checkbox-off";
            }
            if ( disabled ) {
                checkbox.disabled = true;
            }
            return checkbox;
        },
        buildSpan : function( id, className, value ) {
            var span = document.createElement("span");
            if ( id && id.length ) {
                span.id = id;
            }
            if ( className && className.length ) {
                span.className =+ className;
            }
            if ( value ) {
                span.checked = value;
                span.className = "ui-checkbox ui-checkbox-on";
            } else {
                span.className = "ui-checkbox ui-checkbox-off";
            }
            return span;
        },
        buildSpecializedTableCell : function( metadata , data ) {

            if ( data == undefined )
                return builder.buildTableCell(null, null, data);

            if ( metadata.type.name == "string" || metadata.type.name == "number" || metadata.type.name == "date" ) {
                return builder.buildTableCell(null, null, data);
            } else if ( metadata.type.name == "combobox" ) {
                return builder.buildTableCell(null, null, data.description);
            } else if ( metadata.type.name == "combobox-yesno" ) {
                var value = data ? "Yes" : "No";
                return builder.buildTableCell(null, null, value);
            }
            else if ( metadata.type.name == "checkbox" ) {
                var checkbox = builder.buildSpanCheckbox(null, null, data);
                return builder.buildTableCell(null, null, checkbox);
            } else if (  metadata.type.name == "currency" ) {
                return builder.buildTableCell(null, null, converter.decimalParaMoedaReal( data) );
            }

            return null;
        }
    }



    var converter = {
        moedaRealParaDecimal : function( valorEmReal ) {
            var index = valorEmReal.indexOf(",");
            var decimals = valorEmReal.substr(index+1, 2);
            var integer = valorEmReal.substr(0, index);

            while ( integer.indexOf(".") >= 0 ) {
                integer = integer.replace(".", "");
            }

            var number = integer + "." + decimals;
            return number;
        },
        decimalParaMoedaReal : function( num ) {
            var x = 0;

            if(num<0){
                num = Math.abs(num);
                x = 1;
            }
            if(isNaN(num)) num = "0";

            var cents = Math.floor((num*100+0.5)%100);
            num = Math.floor((num*100+0.5)/100).toString();

            if(cents < 10) cents = "0" + cents;

            for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++) {
                num = num.substring(0,num.length-(4*i+3))+"."
                +num.substring(num.length-(4*i+3));
            }

            var ret = num + "," + cents;
            if (x == 1) ret = " ? " + ret;

            return ret;
        }
    }

    var sorter = {
        pair : function( value, row ) {
            this.value = value,
            this.row = row
        },
        compareNumbers : function( a, b ) {
            if ( a["value"] < b["value"] ) {
                return -1
            }
            if ( a["value"] > b["value"] ) {
                return 1
            }
            return 0;
        },
        compareStrings : function( a, b ) {

            var nameA = a["value"].toLowerCase();
            var nameB = b["value"].toLowerCase();

            if (nameA < nameB) {
                return -1
            }
            if (nameA > nameB) {
                return 1
            }
            return 0;
        },
        compareBooleans : function( a, b ) {

            var nameA = a["value"];
            var nameB = b["value"];

            if ( nameA == true && nameB == false ) {
                return -1
            }
            if ( nameB == true && nameA == false ) {
                return 1
            }
            return 0;
        },
        compareDates : function( a, b ) {
            var dateA = a["value"];
            var dateB = b["value"];
            if ( dateA < dateB ) {
                return -1;
            }
            if ( dateA > dateB ) {
                return 1;
            }
            return 0;
        },
        sortField : function(thead) {

            //            var table = $(thead).parents('table')[0];
            var table = $(thead).findFirstParent('table')[0];
            var metadata = $(table).data('metadata');

            if ( !metadata[thead.fieldName].sortable ) {
                return;
            }

            var fieldName = thead.fieldName;
            var pairs = [];
            var value = null;

            //            var tableHead = $(thead).parents('thead')[0];
            var tableHead = $(thead).findFirstParent('thead')[0];

            var tbody = $('tbody',table)[0];

            var order;
            if ( thead.className.search(/rsorted/i) > -1  ) {
                order = "rsorted";
            } else {
                order = "sorted";
            }

            navigator.findLastSortedHeader(tableHead);

            if ( metadata[fieldName].type.name == "string" ||
                metadata[fieldName].type.name == "number" ||
                metadata[fieldName].type.name == "currency") {

                for ( var i = 0; i < tbody.rows.length; ++i ) {
                    var model = tbody.rows[i].modified ? tbody.rows[i].modified : tbody.rows[i].model;
                    value = model[fieldName];
                    pairs.push( new sorter.pair( value , tbody.rows[i] ) );
                }

                if ( metadata[fieldName].type.name == "string" ) {
                    if ( order == "sorted") {
                        pairs.sort(sorter.compareStrings);
                    } else {
                        pairs.reverse(sorter.compareStrings);
                    }

                } else if ( metadata[fieldName].type.name == "number" || metadata[fieldName].type.name == "currency") {
                    if ( order == "sorted") {
                        pairs.sort(sorter.compareNumbers);
                    } else {
                        pairs.reverse(sorter.compareNumbers);
                    }
                }

            } else if ( metadata[fieldName].type.name == "combobox" ) {

                for ( var i = 0; i < tbody.rows.length; ++i ) {
                    var model = tbody.rows[i].modified ? tbody.rows[i].modified : tbody.rows[i].model;
                    value = model[fieldName].description;
                    pairs.push( new sorter.pair( value , tbody.rows[i] ) );
                }

                if ( order == "sorted") {
                    pairs.sort(sorter.compareStrings);
                } else {
                    pairs.reverse(sorter.compareStrings);
                }

            }

            else if ( metadata[fieldName].type.name == "date" ) {

                for ( var i = 0; i < tbody.rows.length; ++i ) {

                    var model = tbody.rows[i].modified ? tbody.rows[i].modified : tbody.rows[i].model;

                    value = model[fieldName];

                    pairs.push( new sorter.pair( new Date(value.substr(6, 4), value.substr(3, 2)-1, value.substr(0, 2) ) , tbody.rows[i] ) );

                }

                if ( order == "sorted") {
                    pairs.sort(sorter.compareDates);
                }
                else {
                    pairs.reverse(sorter.compareDates);
                }

            }
            else if ( metadata[fieldName].type.name == "combobox-yesno" ) {

                for ( var i = 0; i < tbody.rows.length; ++i ) {
                    var model = tbody.rows[i].modified ? tbody.rows[i].modified : tbody.rows[i].model;
                    value = model[fieldName];
                    pairs.push( new sorter.pair( value , tbody.rows[i] ) );
                }

                if ( order == "sorted") {
                    pairs.sort(sorter.compareBooleans);
                } else {
                    pairs.reverse(sorter.compareBooleans);
                }

            }

            for ( var j = 0 ; j < pairs.length ; ++j ) {
                tbody.appendChild(pairs[j].row);
            }

            manipulator.applyEvenAndOdd(table);

            if ( order == "rsorted" ) {
                thead.className = thead.className.concat("sorted");
            } else {
                thead.className = thead.className.concat("rsorted");
            }

        }
    }

    var methods = {
        init : function( settings ) {
            manipulator.build( settings );
            $( settings.self ).data( 'metadata', settings.metadata );
            $( settings.self ).data( 'relatedTables', settings.relatedTables );
            $( settings.self ).data( 'rowsRemovable', settings.rowsRemovable );
            $( settings.self ).live('click', function(event) {
                var target = event.target;
                if ( $(target).hasClass("removable") ) {
                    manipulator.removeTableRow($(target).findFirstParent('tr')[0]);
                } else if (target.nodeName.toLowerCase() == "td") {
                    manipulator.turnCellEditable(target);
                } else if ( target.nodeName.toLowerCase() == "th" ) {
                    sorter.sortField(target);
                }
            });
        },
        destroy : function( table ) {
            $(table).die('click');
        },
        addRow : function( table ) {

            var metadata = $(table).data('metadata');
            var rowsRemovable = $(table).data('rowsRemovable');
            var tbody = $(table).find('tbody')[0];
            var tableRow = manipulator.createRow(metadata, null, rowsRemovable);
            var model = {};
            for ( var field in metadata ) {
                model[field] = "";
            }
            tableRow.model = model;
            if ( $(tbody).find('tr:last').hasClass("odd") ) {
                $(tableRow).addClass("even");
            } else {
                $(tableRow).addClass("odd");
            }

            $(tbody).append( tableRow );
        },
        getRow : function( table , index ) {
            return table[0].tBodies[0].rows[index];
        }, 
        deleteRow : function( table , index ) {
            var tableRow = table[0].tBodies[0].rows[index];
            $(tableRow).remove();
            return tableRow;
        },
        getRowData : function ( table, index, type ) {
            if (!type) type = "JSON";
            var row = table[0].tBodies[0].rows[index];
            return row.modified ? row.modified : row.model;
        },
        getRowsData : function( table, type ) {
            var rows = [];
            if (!type) type = "JSON";
            for ( var i = 0; i < table[0].tBodies[0].rows.length; ++i ) {
                rows.push(methods.getRowData(table, i));
            }
            return rows;            
        },
        getChangedRowsData : function( table, type ) {
            var rows = [];
            if (!type) type = "JSON";
            for ( var i = 0; i < table[0].tBodies[0].rows.length; ++i ) {
                var row = table[0].tBodies[0].rows[i];
                if ( row.modified )
                    rows.push(row.modified);
            }
            return rows;
        }
    }

    $.fn.jsTableComponent = function( a0 , a1 , a2 , a3 , a4 , a5 , a6 , a7 ) {

        var defaults = {
            self : this,
            data : null,
            metadata : null,
            relatedTables : null,
            headerStyle : 1,
            tableBodyStyle : 1,
            rowsRemovable : true
        };

        if ( typeof a0 == "object" ) {
            $.extend( defaults, a0 );

            if ( !defaults.metadata ) {
                alert(alerts['missingMetadata']);
                return;
            }

            if ( !defaults.data ) {
                alert(alerts['missingData']);
                return;
            }

            if ( !defaults.method ) {
                return methods.init.apply(this, [ defaults ]);
            }

        } else if ( typeof a0 == "string" ) {
            if ( methods[a0] ) {
                return methods[a0](this, a1, a2, a3, a4, a5, a6, a7);
            }
            else {
                return $.error( 'Method ' +  a0 + ' does not exist on jQuery.jsTableComponent. ' );
            }
        }
    };
    
    $.fn.findFirstParent = function(nodeName) {
        var parent = $(this).parent();
        if ( parent == null || parent.length < 1 ) return null;
        while ( $(parent).attr('nodeName').toLowerCase() != nodeName ) {
            parent = $(parent).parent();
        }
        return parent;
    }

})( jQuery );
