'use strict';
var datagrids = datagrids || {};
websql.crear().dataBaseAsync("jolugamaweb", "0.1", "English Trainer - JoLuGaMa Web", 5 * 1024 * 1024);


$(document).ready(function() {
    $('#opciones').hide();
    //$('#midatatable').hide();

    if (localStorage.etTipoJuego === 'Vocabulary') {
        document.getElementById('tipoJuego').selectedIndex = 0;
    } else {
        document.getElementById('tipoJuego').selectedIndex = 1;
    }

});


$(window).on('load', function() {
    if (funciones.config().tipoDispositivo("movil") === true) {
        $('#modo').css('width', '100%');
        $('#tipoJuego').css('width', '100%');

    }
    setTimeout(function() {
        datagrids.config().seleccionModo();
    }, 1000);
});
/**
 * Funciones generales que por si solo no sirven y que forman parte de una acción, configuración...
 * @returns {datagrids.misfunciones.Anonym$17}
 */
datagrids.misfunciones = function() {
    return{
        LocalStoragetoArray: function(miLocalStorage, arrayIDs) {
            var resultado = [];
            var mijson = funciones.json().stringToJson2(miLocalStorage);
            var pregunta, respuesta, nivel, lista;
            for (var x = 0; x < mijson.length; x++) {
                var miarray = [];
                pregunta = "" + mijson[x].P.toString();
                respuesta = "" + mijson[x].R.toString();
                pregunta = pregunta.replace(/\"/g, "\'");
                respuesta = respuesta.replace(/\"/g, "\'");
                nivel = "N" + mijson[x].N;
                lista = "L" + mijson[x].L;
                miarray[0] = mijson[x].I;
                //miarray[1] = mijson[x].TIPO;
                miarray[1] = nivel;
                miarray[2] = lista;
                miarray[3] = pregunta;
                miarray[4] = respuesta;
                resultado.push(miarray);
            }
            return resultado;
        }
    };
};





datagrids.config = function() {
    return{
        goBack: function() {
            window.location.href = 'index.html';
        },
        /**
         * al cambiar un select cualquiera acciona esta función
         * @returns {undefined}
         */
        seleccionModo: function() {
            $('#opciones').hide();
            $('#infoCarga').show();
            $('#midatatable').html('');
            setTimeout(function() {
                var selectModo = document.getElementById("modo").value;

                if (selectModo.toLowerCase() === "the worst wrong") {
                    datagrids.config().modo().theWorstWrong();
                } else if (selectModo.toLowerCase() === "wrongs and rights") {
                    datagrids.config().modo().wrongsandRights();
                } else if (selectModo.toLowerCase() === "all") {
                    datagrids.config().modo().all();
                }
            }, 1000);

        },
        /**
         * tipo de acción. modo.
         * Según la opcion de la select elegida, seleccionModo llama a una función de tipo modo
         * @returns {datagrids.config.Anonym$1.modo.Anonym$2}
         */
        modo: function() {
            var tipojuego = document.getElementById("tipoJuego").value;
            var tipo;
            if (tipojuego.toLowerCase() === 'vocabulary') {
                tipo = 'v';
            } else if (tipojuego.toLowerCase() === 'phrases') {
                tipo = 'p';
            }

            return{
                theWorstWrong: function() {
                    var select = "select * from GAME_REG where tipojuego='" + tipo + "' and (correcto - erroneo)<=0";
                    datagrids.accion().rellenaTablafiltro(select, tipojuego);
                },
                wrongsandRights: function() {
                    var select = "select * from GAME_REG where tipojuego='" + tipo + "' ";
                    datagrids.accion().rellenaTablafiltro(select, tipojuego);
                },
                all: function() {
                    datagrids.accion().rellenaTabla(tipojuego.toLowerCase());
                }
            };
        }
    };
};


datagrids.accion = function() {
    return{
        rellenaTablafiltro: function(select, tipojuego) {
            var arrayDatos = [];
            websql.realiza().transaccionAsync(select,
                    function(datos) {
                        for (var i = 0; i < datos.length; i++) {
                            var arr = [];
                            arr[0] = datos[i].id;
                            arr[1] = datos[i].correcto;
                            arr[2] = datos[i].erroneo;
                            arr[3] = datos[i].correcto - datos[i].erroneo; //puntuacion ranking
                            arr[4] = datos[i].mark;
                            arrayDatos.push(arr);
                        }
                        datagrids.accion().rellenaTabla(tipojuego.toLowerCase(), arrayDatos);
                    }, null);
        },
        rellenaTabla: function(tipoJuego, arrayIDs) {
            //$('#mitabla').hide();
            $('#midatatable').html('<table cellpadding="0" cellspacing="0" border="0" class="display " id="mitabla"  ></table>');
            // $('#mitabla').show();
            //console.log(vocabulario_ingles.json)vocabulario_ingles.json
            var tabla;
            if (tipoJuego === 'vocabulary') {
                tabla = datagrids.misfunciones().LocalStoragetoArray(localStorage.etVocabularioIngles);
            } else {
                tabla = datagrids.misfunciones().LocalStoragetoArray(localStorage.etFrasesIngles);
            }
            //solo para the worst wrong y wrongs and rights.  all no.
            if (arrayIDs !== undefined) { //si hay un array de ids, se filtra
                var tablaTemp = [];
                for (var i = 0; i < tabla.length; i++) {
                    for (var j = 0; j < arrayIDs.length; j++) {

                        if (arrayIDs[j][0] === tabla[i][0]) {
                            var arr = [];
                            arr[0] = tabla[i][0];
                            arr[1] = tabla[i][1];
                            arr[2] = tabla[i][2];
                            arr[3] = tabla[i][3];
                            arr[4] = tabla[i][4];
                            arr[5] = arrayIDs[j][1];
                            arr[6] = arrayIDs[j][2];
                            arr[7] = arrayIDs[j][3];
                            arr[8] = arrayIDs[j][4];
                            tablaTemp.push(arr);
                            //break;
                        }
                    }
                }

                tabla = tablaTemp;
                var table = $('#mitabla').dataTable({
                    // "processing": true,
                    "language": {
                        "lengthMenu": "_MENU_",
                        "zeroRecords": "Nothing found - sorry",
                        "info": "_PAGE_ of _PAGES_",
                        "infoEmpty": "No records available",
                        "infoFiltered": "(filtered)"
                    },
                    "data": tabla,
                    "pagingType": "simple",
                    "scrollX": true,
                    "initComplete": function() {
                        $('#infoCarga').hide();
                        $('#opciones').show(2000);
                    },
                    "columns": [
                        {"title": "ID"},
                        //{"title": "TIPO", "visible": false},
                        {"title": "LEVEL", "class": "center"},
                        {"title": "LIST", "class": "center"},
                        {"title": "QUESTION"},
                        {"title": "ANSWER"},
                        {"title": "RIGHT", "class": "center"},
                        {"title": "WRONG", "class": "center"},
                        {"title": "RANKING", "class": "center", "orderDataType": "dom-text", "type": "numeric"},
                        {"title": "MARK", "class": "center"}
                    ],
                    "order": [[7, "asc"]]
                });

            } else {  //para all
                var table = $('#mitabla').dataTable({
                    // "processing": true,
                    "language": {
                        "lengthMenu": "_MENU_",
                        "zeroRecords": "Nothing found - sorry",
                        "info": "_PAGE_ of _PAGES_",
                        "infoEmpty": "No records available",
                        "infoFiltered": "(filtered)"
                    },
                    "data": tabla,
                    "pagingType": "simple",
                    "scrollX": true,
                    "initComplete": function() {
                        $('#infoCarga').hide();
                        $('#opciones').show(2000);

                    },
                    "columns": [
                        {"title": "ID"},
                        //{"title": "TIPO", "visible": false},
                        {"title": "LEVEL", "class": "center"},
                        {"title": "LIST", "class": "center"},
                        {"title": "QUESTION"},
                        {"title": "ANSWER"}
                    ]
                });
            }

            //al pulsar click, se escucha la palabra en inglés
            $('#mitabla tbody').on('click', 'tr', function() {
                var columnaIdioma = $('td:eq(4)', this).html();
                columnaIdioma = columnaIdioma.replace('"', "'");
                funciones.sonidos().habla("en", columnaIdioma);
            });
        }
    };
};




