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

$("#tableComponent").jsTableComponent({
    metadata : metadata,
    data: data,
    relatedTables : relatedTables,
    headerStyle: 2
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
