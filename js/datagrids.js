'use strict';
var datagrids = datagrids || {};
websql.crear().dataBaseAsync("jolugamaweb", "0.1", "English Trainer - JoLuGaMa Web", 5 * 1024 * 1024);
datagrids.arrayCeldas = [];

$(document).ready(function () {
    $('#opciones').hide();
    $('#buscadores').hide();
    $('#playList').hide();
    $('#boxModificaDataGrid').hide();
    $('#addModify').hide();
    //$('#midatatable').hide();

    if (localStorage.etTipoJuego === 'Vocabulary') {
        document.getElementById('tipoJuego').selectedIndex = 0;
    } else {
        document.getElementById('tipoJuego').selectedIndex = 1;
    }

});


$(window).on('load', function () {
    if (funciones.config().tipoDispositivo("movil") === true) {
        $('#modo').css('width', '100%');
        $('#tipoJuego').css('width', '100%');

    }
    setTimeout(function () {
        document.getElementById('modo').selectedIndex = 2; //cambio a all
        datagrids.config().seleccionModo();
    }, 1000);

    //de esta forma, no se propaga submit y no se actualiza, pero si valida con html5. 
    $('#formularioAddModify').on('submit', function (e) {
        datagrids.modificaGrid().anadeModificaBorra();
        e.preventDefault();
    });


});


/**
 * Funciones generales que por si solo no sirven y que forman parte de una acción, configuración...
 * @returns {datagrids.misfunciones.Anonym$17}
 */
datagrids.misfunciones = function () {
    return{
        LocalStoragetoArray: function (miLocalStorage) {
            var resultado = [];
            var mijson = funciones.json().stringToJson2(miLocalStorage);
            var pregunta, respuesta, nivel, lista;
            for (var x = 0; x < mijson.length; x++) {
                var miarray = [];
                pregunta = "" + mijson[x].P.toString();
                respuesta = "" + mijson[x].R.toString();
                pregunta = pregunta.replace(/\"/g, "\'");
                respuesta = respuesta.replace(/\"/g, "\'");
                nivel = mijson[x].N;
                lista = mijson[x].L;
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





datagrids.config = function () {
    return{
        goBack: function () {
            window.location.href = 'index.html';
        },
        /**
         * al cambiar un select cualquiera acciona esta función
         * @returns {undefined}
         */
        seleccionModo: function () {
            $('#opciones').hide();
            $('#buscadores').hide();
            $('#playList').hide();
            $('#addModify').hide();
            $('#infoCarga').show();
            $('#midatatable').html('');
            setTimeout(function () {
                var selectModo = document.getElementById("modo").value;

                if (selectModo.toLowerCase() === "the worst wrong") {
                    datagrids.config().modo().theWorstWrong();
                } else if (selectModo.toLowerCase() === "wrongs and rights") {
                    datagrids.config().modo().wrongsandRights();
                } else if (selectModo.toLowerCase() === "all") {
                    datagrids.config().modo().all();
                }
            }, 1000);
            setTimeout(function () {
                $('#addModify').show();
                document.getElementById("manade").disabled = "";
            }, 3000);

        },
        /**
         * tipo de acción. modo.
         * Según la opcion de la select elegida, seleccionModo llama a una función de tipo modo
         * @returns {datagrids.config.Anonym$1.modo.Anonym$2}
         */
        modo: function () {
            var tipojuego = document.getElementById("tipoJuego").value;
            var tipo;
            if (tipojuego.toLowerCase() === 'vocabulary') {
                tipo = 'v';
            } else if (tipojuego.toLowerCase() === 'phrases') {
                tipo = 'p';
            }

            return{
                theWorstWrong: function () {
                    var select = "select * from GAME_REG where tipojuego='" + tipo + "' and (correcto - erroneo)<=0";
                    datagrids.accion().rellenaTablafiltro(select, tipojuego);
                },
                wrongsandRights: function () {
                    var select = "select * from GAME_REG where tipojuego='" + tipo + "' ";
                    datagrids.accion().rellenaTablafiltro(select, tipojuego);
                },
                all: function () {
                    datagrids.accion().rellenaTabla(tipojuego.toLowerCase());
                }
            };
        }
    };
};


datagrids.accion = function () {
    return{
        rellenaTablafiltro: function (select, tipojuego) {
            var arrayDatos = [];
            websql.realiza().transaccionAsync(select,
                    function (datos) {
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
        rellenaTabla: function (tipoJuego, arrayIDs) {
            $('#midatatable').html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="mitabla"></table>');

            //saco la información de localStorage
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
                    stateSave: true,
                    "language": {
                        "lengthMenu": "_MENU_",
                        "zeroRecords": "Nothing found",
                        "info": "_PAGE_ of _PAGES_",
                        "infoEmpty": "No records available",
                        "infoFiltered": "(filtered)"
                    },
                    "data": tabla,
                    "pagingType": "full",
                    "sScrollX": "95%",
                    "sScrollXInner": "99%",
                    "bScrollCollapse": true,
                    "initComplete": function () {
                        $('#infoCarga').hide();
                        $('#opciones').show(2000);
                        $('#buscadores').fadeIn(1000);
                        $('#playList').show();
                        $('div.dataTables_filter').hide(); //escondo el buscador por defecto
                        $('#global_filter').focus();
                        //setTimeout(function () { $('#global_filter').focus(); }, 500);
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
                    stateSave: true,
                    "language": {
                        "lengthMenu": "_MENU_",
                        "zeroRecords": "Nothing found",
                        "info": "_PAGE_ of _PAGES_",
                        "infoEmpty": "No records available",
                        "infoFiltered": "(filtered)"
                    },
                    "data": tabla,
                    "pagingType": "full",
                    "sScrollX": "95%",
                    "sScrollXInner": "99%",
                    "bScrollCollapse": true,
                    "initComplete": function () {
                        $('#infoCarga').hide();
                        $('#opciones').show(2000);
                        $('#buscadores').fadeIn(1000);
                        $('#playList').show();
                        $('div.dataTables_filter').hide(); //escondo el buscador por defecto
                        $('#global_filter').focus();
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


            function filterGlobal() {
                $('#mitabla').DataTable().search(
                        $('#global_filter').val(),
                        $('#global_regex').prop('checked'),
                        $('#global_smart').prop('checked')
                        ).draw();
            }

            function filterColumn(i) {
                $('#mitabla').DataTable().column(i).search(
                        $('#col' + i + '_filter').val(),
                        $('#col' + i + '_regex').prop('checked'),
                        $('#col' + i + '_smart').prop('checked')
                        ).draw();
            }

            $('input.global_filter').on('keyup click', function () {
                filterGlobal();
            });

            $('input.column_filter').on('keyup click', function () {
                filterColumn($(this).parents('tr').attr('data-column'));
            });



            //al pulsar click, se escucha la palabra en inglés.
            $("#mitabla").on("click", "tbody tr", function (event) {
                var columnaIdioma = $('td:eq(4)', this).html();
                columnaIdioma = columnaIdioma.replace('"', "'");
                funciones.sonidos().habla("en", columnaIdioma);

                var id = $('td:eq(0)', this).html();
                var level = $('td:eq(1)', this).html();
                var list = $('td:eq(2)', this).html();
                var question = $('td:eq(3)', this).html();
                $('#mid').val(id);
                $('#mlevel').val(level);
                $('#mlist').val(list);
                $('#mquestion').val(question);
                $('#manswer').val(columnaIdioma);
                var tipo = $('#tipoJuego').val()
                $('#mtipoJuego').val(tipo);
                datagrids.modificaGrid().controlaId();

            });

            //se borra anterior botón. Esto pasa cuando se cambia de select, que se crea otro.
            try {
                var element = document.getElementById("playListBoton");
                element.parentNode.removeChild(element);
            } catch (e) {
            }

            //crea boton playListBoton y lo coloca en playList
            var btn = document.createElement("BUTTON");
            btn.setAttribute("id", "playListBoton");
            btn.setAttribute("type", "button");
            btn.setAttribute("title", "Practice listening to the list that is displayed on screen");
            btn.setAttribute("disabled", "");
            btn.setAttribute("class", "btn btn-primary");
            var t = document.createTextNode("Play List");
            btn.appendChild(t);
            var lugarBoton = document.getElementById("playList");
            lugarBoton.appendChild(btn)
            document.getElementById("playListBoton").disabled = "";


            //se crea evento click.
            $('#playListBoton').on('click', function () {
                document.getElementById("playListBoton").disabled = "disabled";
                setTimeout(function () {
                    document.getElementById("playListBoton").disabled = "";
                }, 5000);
                datagrids.arrayCeldas = [];
                $('#mitabla tbody tr').each(function (misfilas) {
                    var pregunta, respuesta;
                    var miarrayColumna = [];

                    $(this).children("td").each(function (miscolumnas) {

                        switch (miscolumnas) {
                            case 3:
                                pregunta = $(this).text();
                                break;
                            case 4:
                                respuesta = $(this).text();
                                break;
                        }

                    });
                    miarrayColumna.push(pregunta);
                    miarrayColumna.push(respuesta);
                    datagrids.arrayCeldas.push(miarrayColumna);

                });
                //recorro el resultado y muestro realizo tts en pregunta y respuesta
                for (var i = 0; i < datagrids.arrayCeldas.length; i++) {
                    var miarray = datagrids.arrayCeldas[i];
                    funciones.sonidos().habla('es', miarray[0]);
                    funciones.sonidos().habla('en', miarray[1]);
                    //setTimeout(function() {console.log('-');},1250);
                    console.log(miarray[0] + " - " + miarray[1])
                }


            });

        }
    };
};

datagrids.modificaGrid = function () {
    return{
        cambiaVisibilidad: function () {
            $('#boxModificaDataGrid').toggle();
        },
        controlaId: function () {
            var mid = $('#mid').val();
            if (mid.length < 1) {
                $('#manade').val('Add');
                $('#mdelete').attr('disabled', true);
            } else {
                $('#manade').val('Modify');
                $('#mdelete').attr('disabled', false);
            }
        },
        anadeModificaBorra: function (esBorrar) {

            document.getElementById("manade").disabled = "disabled";
            setTimeout(function () {
                document.getElementById("manade").disabled = "";
            }, 3000);

            //guardo en variables los inputs
            var mid = $('#mid').val();
            var mlevel = $('#mlevel').val();
            var mlist = $('#mlist').val();
            var mquestion = $('#mquestion').val();
            var manswer = $('#manswer').val();
            var tipo;


            //recupero bbdd del localStorage
            var mtipoJuego = document.getElementById("mtipoJuego").value.toLowerCase();

            var tabla;
            if (mtipoJuego === 'vocabulary') {
                tabla = datagrids.misfunciones().LocalStoragetoArray(localStorage.etVocabularioIngles);
                tipo = 'V';
            } else {
                tabla = datagrids.misfunciones().LocalStoragetoArray(localStorage.etFrasesIngles);
                tipo = 'F';
            }

            if (mid === '') { //si es un registro nuevo
                var ultimo = tabla[tabla.length - 1][0];
                if (ultimo < 40000) { //esto es para que si añado yo por mi parte no haga conflicto con estos.
                    ultimo = 40000;
                }
                ultimo += 1;
                var copiaLocalStorage;
                if (mtipoJuego === 'vocabulary') {
                    copiaLocalStorage = localStorage.etVocabularioIngles;
                } else {
                    copiaLocalStorage = localStorage.etFrasesIngles;
                }

                copiaLocalStorage = copiaLocalStorage.substr(0, copiaLocalStorage.length - 1); //quito el caracter ]
                copiaLocalStorage += ',';
                copiaLocalStorage += '{"I":' + ultimo + ',"T":"' + tipo + '","N":"' + mlevel.toUpperCase() + '","L":"' + mlist.toUpperCase() + '","P":"' + mquestion.toUpperCase() + '","R":"' + manswer.toUpperCase() + '"}';
                copiaLocalStorage += ']';
                if (mtipoJuego === 'vocabulary') {
                    localStorage.etVocabularioIngles = copiaLocalStorage;
                } else {
                    localStorage.etFrasesIngles = copiaLocalStorage;
                }
                $('#mmensaje').html('The row was added successfully.');
                setTimeout(function () {
                    $('#mmensaje').html('');
                }, 5000);
                $('#mquestion').val('');
                $('#manswer').val('');
                $('#mquestion').focus();


            } else { //si es modificación o delete
                var tablam;
                if (mtipoJuego === 'vocabulary') {
                    tablam = JSON.parse(localStorage.etVocabularioIngles);
                } else {
                    tablam = JSON.parse(localStorage.etFrasesIngles);
                }

                var encontrado = false;
                for (var i = 0; i < tablam.length; i++) {
                    if (mid === parseInt(tablam[i]['I']).toString()) { //si encuentra modifica
                        if (esBorrar === undefined || esBorrar === false) { //si es modificar
                            tablam[i]['N'] = mlevel.toUpperCase();
                            tablam[i]['L'] = mlist.toUpperCase();
                            tablam[i]['P'] = mquestion.toUpperCase();
                            tablam[i]['R'] = manswer.toUpperCase();
                            $('#mmensaje').html('The modification was successful.');
                        } else { //si es borrar
                            tablam.splice(i, 1);
                            $('#mdelete').attr('disabled', true);
                            $('#mmensaje').html('The row was deleted.');
                        }

                        encontrado = true;

                        $('#mid').val('');
                        $('#mlevel').val('');
                        $('#mlist').val('');
                        $('#mquestion').val('');
                        $('#manswer').val('');
                        $('#mlevel').focus();


                        setTimeout(function () {
                            $('#mmensaje').html('');
                        }, 5000);
//                        var tablaToJson = JSON.parse(tabla);
                        var txt = JSON.stringify(tablam);

                        if (mtipoJuego === 'vocabulary') {
                            localStorage.etVocabularioIngles = txt;
                        } else {
                            localStorage.etFrasesIngles = txt;
                        }
                        break;
                    }
                }

            }


            datagrids.modificaGrid().cambiaVisibilidad();
            document.getElementById('modo').selectedIndex = 2; //cambio a all
            datagrids.config().seleccionModo() //actualizo pantalla

            setTimeout(function () {
                $('#col1_filter').val(mlevel).trigger($.Event("keyup", {keyCode: 13}));
                ;
                $('#col2_filter').val(mlist).trigger($.Event("keyup", {keyCode: 13}));
                ;
                $('#global_filter').focus();
                datagrids.modificaGrid().cambiaVisibilidad();
            }, 1500);


        },
        trasResetear: function () {
            $('#mlevel').focus();
        }

    };
};




