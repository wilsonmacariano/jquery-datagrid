var metadata =
{
    id : {
        fieldName: "id",
        columnName: "Id",
        type: {
            name: "number"
        },
        sortable : true,
        editable : false
    },
    name : {
        fieldName: "name",
        columnName: "Nome",
        type: {
            name: "string"
        },
        sortable : true,
        editable : true
    },
    sex: {
        fieldName: "sex",
        columnName: "Sexo",
        type: {
            name: "combobox",
            value: "id",
            text: "description",
            relatedTable: "sexo"
        },
        sortable : true,
        editable : true
    },
    date : {
        fieldName: "date",
        columnName: "Data",
        type: {
            name: "date"
        },
        sortable : true,
        editable : true
    },
    masterDegree : {
        fieldName: "masterDegree",
        columnName: "Mestrado",
        type : {
            name: "combobox-yesno"
        },
        sortable: true,
        editable: true
    },
    dinheiro : {
        fieldName: "dinheiro",
        columnName: "Dinheiro",
        type: {
            name: "currency"
        },
        sortable : true,
        editable : true
    }
};

var data = [ {
    id: 1,
    name: "George Lucas",
    sex: {
        id: 1,
        description: "Masculino"
    },
    date: "03/02/2011",
    masterDegree : true,
    dinheiro : 3678.35
}, {
    id: 2,
    name: "Anakin Skywalker",
    sex: {
        id: 1,
        description: "Masculino"
    },
    date: "02/02/2011",
    masterDegree : false,
    dinheiro : 13350.35
},
{
    id: 3,
    name: "Luke Skywalker",
    sex: {
        id: 2,
        description: "Feminino"
    },
    date: "01/02/2011",
    masterDegree : true,
    dinheiro : 93.99
},
{
    id: 4,
    name: "Chewbacca",
    sex: {
        id: 2,
        description: "Feminino"
    },
    date: "31/01/2011",
    masterDegree : true,
    dinheiro : 721.35
},
{
    id: 5,
    name: "Wilson Filho",
    sex: {
        id: 1,
        description: "Masculino"
    },
    date: "07/03/2011",
    masterDegree : false,
    dinheiro : 599.69
},
{
    id: 6,
    name: "Heber Pimentel",
    sex: {
        id: 1,
        description: "Masculino"
    },
    date: "03/02/2011",
    masterDegree : false,
    dinheiro : 1000.00
},
{
    id: 7,
    name: "Paulo Henrique",
    sex: {
        id: 1,
        description: "Masculino"
    },
    date: "25/09/2011",
    masterDegree : true,
    dinheiro : 15359.99
},
{
    id: 8,
    name: "Hiarlay Araujo Rolim Tur",
    sex: {
        id: 1,
        description: "Masculino"
    },
    date: "03/02/2011",
    masterDegree : true,
    dinheiro : 352.69
} ];

var relatedTables = {
    sexo : [
    {
        id: 1,
        description: "Masculino"
    },
    {
        id: 2,
        description: "Feminino"
    } ]
};

currencyToDecimal = function( valorEmReal ) {
    var index = valorEmReal.indexOf(",");
    var decimals = valorEmReal.substr(index+1, 2);
    var integer = valorEmReal.substr(0, index);

    while ( integer.indexOf(".") >= 0 ) {
        integer = integer.replace(".", "");
    }

    var number = integer + "." + decimals;
    return number;
}
    
decimalToCurrency = function( num ) {
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

$("#tableComponent").jsTableComponent({
    metadata : metadata,
    data: data,
    relatedTables : relatedTables,
    headerStyle: 2,
    currencyToDecimal : currencyToDecimal,
    decimalToCurrency : decimalToCurrency,
    maxRowsPerPage: 3
});

$("#destroy").click( function() {
    $("#tableComponent").jsTableComponent('destroy');
} );


$("#tableComponent2").jsTableComponent( {
    metadata : metadata,
    data: data,
    relatedTables : relatedTables,
    headerStyle: 2
});
