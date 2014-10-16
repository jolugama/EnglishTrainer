'use strict';
/**
 * Namespace index. para index.html
 * @type @exp;index
 */
var index = index || {};
websql.crear().dataBaseAsync("jolugamaweb", "0.1", "English Trainer - JoLuGaMa Web", 5 * 1024 * 1024);
index.voc_ing, index.fra_ing; //localStorage. son strings
index.voc_ingJSON, index.fra_ingJSON; //recogo la info de localStorage y lo paso a objetos Json
index.arrayColores = [];
index.estaCargando = true;
$(document).ready(function () {
    //Detectar navegador y avisar si no es chrome
    var navegador = navigator.userAgent.toLowerCase()
    if (navegador.indexOf('chrome') > -1) {  //es chrome
        $('#quenavegadores').hide();
    } else if (navegador.indexOf('opera') > -1 || navegador.indexOf('safari') > -1) {  //es opera o safari
        $('#quenavegadores').html("If you're using Opera and Safary, you can play but not hear the TTS. If you want it to work properly, use CHROME. Thank you. ");
        setTimeout(function () {
            $('#quenavegadores').html('<br>');
        }, 8000);

    }
//websql.realiza().query("DROP TABLE IF EXISTS GAME_REG");
    websql.realiza().query("CREATE TABLE IF NOT EXISTS GAME_REG (id_reg INTEGER PRIMARY KEY AUTOINCREMENT,id INTEGER,tipojuego TEXT,idioma TEXT,correcto INTEGER,erroneo INTEGER,mark INTEGER)");
    //websql.realiza().query("DROP TABLE IF EXISTS GAME_VOC_ING");
    websql.realiza().query("CREATE TABLE IF NOT EXISTS GAME_VOC_ING (id INTEGER PRIMARY KEY,tipo TEXT,nivel TEXT,lista TEXT,pregunta TEXT,respuesta TEXT)");
    //websql.realiza().query("DROP TABLE IF EXISTS GAME_FRA_ING");
    websql.realiza().query("CREATE TABLE IF NOT EXISTS GAME_FRA_ING (id INTEGER PRIMARY KEY,tipo TEXT,nivel TEXT,lista TEXT,pregunta TEXT,respuesta TEXT)");
    $('#lateral').hide();

    $('#miformulario').hide();
});
//una vez se carga del todo la página
$(window).on('load', function () {
//CARGA DE DATOS
//datos de json de vocabulario y frases (si existe se carga de session y si no, se genera session)
    if (localStorage.etVocabularioIngles) {
        index.voc_ing = localStorage.etVocabularioIngles; //se carga localStorage vocabularioIngles
    } else {
        localStorage.etVocabularioIngles = vocabulario_ingles.json; //no existe session de vocabulario ingles. Se crea.
    }

    if (localStorage.etFrasesIngles) {
        index.fra_ing = localStorage.etFrasesIngles; //se carga localStorage frasesIngles
    } else {
        localStorage.etFrasesIngles = frase_ingles.json; //no existe session de frases ingles. Se crea.
    }

//cargo tipoJuego
    index.voc_ingJSON = funciones.json().stringToJson2(localStorage.etVocabularioIngles);
    index.fra_ingJSON = funciones.json().stringToJson2(localStorage.etFrasesIngles);

    document.getElementById("tipoJuego").value = localStorage.etTipoJuego;
    index.accion().estadoSelectTipoJuego();
    $('#infoCarga').hide();
    $('#miformulario').fadeIn(3000);
    $('#lateral').fadeIn(3000);
    index.config().compruebaFelicitaciones();

});
/**
 *
 * @returns {index.config.Anonym$0}
 * funciones que se ejecutan una sola vez, al principio o no.
 */
index.config = function () {
    return{
        compruebaFelicitaciones: function () {
            websql.realiza().transaccionAsync("select count(*) as num from GAME_VOC_ING where lista='FELICITACIONES'", function (datos) {
                if (datos[0].num === 0) {
//se inserta los niveles para estádisticas
                    localStorage.etNivelesVocabularioIngles = index.accion().recogeNiveles(index.voc_ingJSON);
                    localStorage.etNivelesFrasesIngles = index.accion().recogeNiveles(index.fra_ingJSON);
                    console.log('se inserta felicitaciones felicitaciones');
                    index.accion().inserccion(index.voc_ingJSON, '1', 'FELICITACIONES', function () {
                        console.log('felicitaciones insertadas!');
                    });
                }
            });
        },
        botonPlay: function () {
            var nivel = document.getElementById("selectNivel").value;
            var lista = document.getElementById("selectLista").value;
            console.log(" Modo:" + localStorage.etTipoJuego + " nivel:" + nivel + " Lista:" + lista);
            localStorage.etNivel = nivel;
            localStorage.etLista = lista;
            var arrayJson;
            if (document.getElementById("tipoJuego").value === "Vocabulary") {
                arrayJson = index.voc_ingJSON;
            } else {
                arrayJson = index.fra_ingJSON;
            }
            index.accion().inserccion(arrayJson, nivel, lista, function () {
                window.location.href = 'game.html';
            });
//tipoJuego "vocabulary" o "phrases"
        },
        botondatagrids: function () {
            window.location.href = 'datagrids.html';
        },
        botonStatistics: function () {
            window.location.href = 'statistics.html';
        },
        randomList: function () {
            var lista = document.getElementById("selectLista");
            var nivel = document.getElementById("selectNivel");
            var modo;
            if (document.getElementById("tipoJuego").value === "Vocabulary") {
                modo = 'v';
            } else {
                modo = 'p';
            }
            var num;
            var randomLista = sessionStorage.etRandomLista;
            if (randomLista === undefined) {  //si se abre por primera vez el navegador,  se pone a cero la lista
                randomLista = "";
                sessionStorage.etRandomLista = randomLista;
            }

            var haSidoJugado = false; //valor por defecto
            var listado = [];
            var juegosJugados = sessionStorage.etRandomLista.split(",");

            //añado a array listado todos los juegos jugados de la lista seleccionada
            for (var i = 0; i < juegosJugados.length; i++) {
                var juego = juegosJugados[i].split("-");
                if (juego[1] === nivel.value) {
                    listado.push(juego[2]);
                }
            }

            //repetir aleatorio mientras:
            //el elegido sea verde, el num de verdes no sean todos
            var contador = 0;
            do {
                //si en n veces no encuentra uno, elige uno cualquiera.
                //pasa cuando se han jugado a todos los no verdes. se resetea la lista.
                contador+= 1;
                if (contador > 20) {
                    listado="";
//                    alert('se resetea')
                }

                do {
                    _.shuffle(listado); //desordeno la lista.
                    num = _.random(0, lista.length - 3); //elijo un random sin contar con wrong y marks

                    if (_.contains(listado, lista[num].value)) {
                        haSidoJugado = true;
                    } else {
                        haSidoJugado = false;
                    }
                } while (haSidoJugado === true && (listado.length < lista.length - 2));
                lista.selectedIndex = num; //asigno el numero a la select

                var color = "SINCOLOR";
                try {
                    color = index.arrayColores[num].color;
                } catch (e) {
                }
//                alert("POSICION " + num + " - COLOR " + color)

            } while (index.config().buscarNuevaLista(num) === true);




            if (haSidoJugado === false) {
                if (randomLista === '') {
                    sessionStorage.etRandomLista = modo + "-" + nivel.value + "-" + lista.value;
                } else {
                    sessionStorage.etRandomLista = randomLista + "," + modo + "-" + nivel.value + "-" + lista.value;
                }
            }

            localStorage.etLista = lista.value; //guardo el valor de la lista en local
//            console.log(sessionStorage.etRandomLista);
            index.config().botonPlay();
        },
        buscarNuevaLista: function (posicion) {
            var contador = 0;
            var resultado = false;
            var color = "indefinido";
            try {
                color = index.arrayColores[posicion].color

                if (color !== 'indefinido') {
                    //recuento numero de verdes
                    if (index.arrayColores[posicion].color === 'VERDE') {  //si se ha jugado ya, verifico si hay alguna lista no jugada
                        resultado = true;
                        for (var j = 0; j < index.arrayColores.length; j++) {
                            if (index.arrayColores[j].color === 'VERDE') {
                                contador += 1;
                            }
                        }
                        if ((index.arrayColores.length) === contador) {   //indica que hay tantos verdes como listas. osea, no quedan listas.
                            resultado = false;
                        }

                    }
                }
            } catch (e) {
                resultado = false;
            }
            return resultado;

        }

    };
};

index.accion = function () {
    return{
        //segun se cambie la select podrá ser Vocabulary o Phrases
        estadoSelectTipoJuego: function () {
            if (!localStorage.etTipoJuego) {
                document.getElementById('tipoJuego').selectedIndex = 0;
            }
            var tipoJuego = document.getElementById("tipoJuego").value;
            localStorage.etTipoJuego = document.getElementById("tipoJuego").value;
            index.accion().rellenaSelectNivel(tipoJuego);
        },
        rellenaSelectNivel: function (tipoJ) {
            //meto en un array los niveles
            var miarray = [];
            if (tipoJ === 'Vocabulary') {
                for (var x = 0; x < index.voc_ingJSON.length; x++) {
                    miarray.push(index.voc_ingJSON[x].N);
                }
            } else {
                for (var x = 0; x < index.fra_ingJSON.length; x++) {
                    miarray.push(index.fra_ingJSON[x].N);
                }
            }
            miarray = funciones.array().ordenayUnicos(miarray); //ordeno y elimino duplicados

            //borro options anteriores y creo los actuales.
            var seleccion = document.getElementById("selectNivel");
            seleccion.value = localStorage.etNivel;
//            console.log(localStorage.etNivel)

            while (seleccion.options.length) {
                seleccion.remove(0);
            }
            for (var x = 0; x < miarray.length; x++) {
                var opcion = new Option(miarray[x], miarray[x]);
                seleccion.options.add(opcion);
            }

            if (localStorage.etNivel !== undefined) {
                document.getElementById("selectNivel").value = localStorage.etNivel;
                document.getElementById("selectLista").value = localStorage.etLista;
            } else {
                document.getElementById("selectNivel").selectedIndex = 0;
                localStorage.etNivel = document.getElementById("selectNivel").value;
            }


            if (index.estaCargando !== true) {
                document.getElementById("selectNivel").selectedIndex = 0;
                localStorage.etNivel = document.getElementById("selectNivel").value;
            }
            index.accion().coloresLista();
        },
        borraOptionLista: function (nombreid) {
            //borro options anteriores y creo los actuales.
            var seleccion = document.getElementById(nombreid);
            while (seleccion.options.length) {
                seleccion.remove(0);
            }
            while (seleccion.options.length) {
                seleccion.remove(0);
            }
        },
        rellenaSelectLista: function () {
            var tipoJuego = document.getElementById("tipoJuego").value;
            var selecNivel = document.getElementById("selectNivel").value;
            //meto en un array los niveles
            var miarray = [];
            if (tipoJuego === 'Vocabulary') {
                for (var x = 0; x < index.voc_ingJSON.length; x++) {
                    if (index.voc_ingJSON[x].N.toString() === selecNivel) {
                        miarray.push(index.voc_ingJSON[x].L);
                    }
                }
            } else {
                for (var x = 0; x < index.fra_ingJSON.length; x++) {
                    if (index.fra_ingJSON[x].N.toString() === selecNivel) {
                        miarray.push(index.fra_ingJSON[x].L);
                    }
                }
            }
            miarray = funciones.array().ordenayUnicos(miarray); //ordeno y elimino duplicados
            miarray.push("Wrongs");
            miarray.push("Marks");
            //borro options anteriores y creo los actuales.
            index.accion().borraOptionLista("selectLista");
            var seleccion = document.getElementById("selectLista");
            //  console.log(index.arrayColores);
            for (var x = 0; x < miarray.length; x++) {
                var opcion = new Option(miarray[x], miarray[x]);
                for (var j = 0; j < index.arrayColores.length; j++) {
                    // console.log(index.arrayColores[j])
                    if (index.arrayColores[j].lista === miarray[x]) {
                        if (index.arrayColores[j].color === 'ROJO') {  //hay fallos
                            opcion.style.color = "white";
                            opcion.style.backgroundColor = "#FF4000";
                        } else if (index.arrayColores[j].color === 'VERDE') {  //todas bien
                            //opcion.style.color = "black";
                            opcion.style.backgroundColor = "#9FF781";
                        } else if (index.arrayColores[j].color === 'NEGRO') {  //se ha dado a play y luego cerrado, sin fallos y sin aciertos.
                            //opcion.style.color = "white";
                            opcion.style.backgroundColor = "orange"; //se elige en vista el color naranja para mejorar el aspecto.
                        }

                    }
                }

                seleccion.options.add(opcion);
            }


            seleccion.value = localStorage.etLista;
            if (localStorage.etLista == undefined) {
                document.getElementById("selectLista").selectedIndex = 0;
                localStorage.etLista = document.getElementById("selectLista").value;
            }
            if (document.getElementById("selectLista").value == '') {
                document.getElementById("selectLista").selectedIndex = 0;
                localStorage.etLista = document.getElementById("selectLista").value;
            }

        },
        cambiaLista: function () {
            localStorage.etLista = document.getElementById("selectLista").value;
        },
        coloresLista: function () {
            //guarda el nivel siempre, menos la primera vez que se carga, ya que asi carga la guardada
            if (index.estaCargando !== true) {
                document.getElementById("selectLista").selectedIndex = 0;
                localStorage.etNivel = document.getElementById("selectNivel").value;
                localStorage.etLista = document.getElementById("selectLista").value;
            } else {
                document.getElementById("selectNivel").value = localStorage.etNivel;
                document.getElementById("selectLista").value = localStorage.etLista;
            }
            index.estaCargando = false;
            try {
                var tJuego = document.getElementById("tipoJuego").value;
                var nivel = document.getElementById("selectNivel").value;
                var tabla;
                var tipojuego;
                if (tJuego === 'Vocabulary') {
                    tabla = "GAME_VOC_ING";
                    tipojuego = "v";
                } else {
                    tabla = "GAME_FRA_ING";
                    tipojuego = "p";
                }
                //index.accion().rellenaSelectLista();
                var consul = " select lista,case when pts>0 then 'VERDE' WHEN pts<0 then 'ROJO' ELSE 'NEGRO' END AS color from "
                        + " (select distinct lista,min(puntuacion) as pts from "
                        + " (SELECT " + tabla + ".NIVEL,lista,case when ifnull(correcto,0)- ifnull(erroneo,0)=0 and ifnull(erroneo,0)!=0 then -1 else ifnull(correcto,0)- ifnull(erroneo,0) end as puntuacion FROM " + tabla + "  "
                        + " left OUTER JOIN (select * from GAME_REG where tipojuego='" + tipojuego + "') as tabla on " + tabla + ".ID=tabla.ID "
                        + " where " + tabla + ".NIVEL='" + nivel + "')supertabla "
                        + " group by supertabla.nivel,supertabla.lista)supertabla2";
                websql.realiza().transaccionAsync(consul,
                        function (datos) {
                            //console.log(datos)
                            index.arrayColores = datos;
                            index.accion().rellenaSelectLista();
                        });
            } catch (e) {
                console.log("error en coloreslista");
            }
        },
        //inserta la lista elegida del tipo de juego y nivel, y se inserta a websql para recoger en pantalla game
        inserccion: function (c, nivel, lista, callback) {
            // c --> coleccionObjetosJson;
            var pregunta, respuesta;
            var arraydeInsercciones = [];
            for (var x = 0; x < c.length; x++) {
                if (c[x].N.toString() === nivel && c[x].L.toString() === lista) {
                    pregunta = "" + c[x].P.toString();
                    respuesta = "" + c[x].R.toString();
                    pregunta = pregunta.replace(/\"/g, "\''");
                    respuesta = respuesta.replace(/\"/g, "\''");
                    if (c[0].T === "V") {
                        arraydeInsercciones.push("INSERT INTO GAME_VOC_ING (id,tipo,nivel,lista,pregunta,respuesta) VALUES(" + c[x].I + ",'" + c[x].T + "','" + c[x].N.toString() + "','" + c[x].L.toString() + "','" + pregunta + "','" + respuesta + "')");
                    } else {
                        arraydeInsercciones.push("INSERT INTO GAME_FRA_ING (id,tipo,nivel,lista,pregunta,respuesta) VALUES(" + c[x].I + ",'" + c[x].T + "','" + c[x].N.toString() + "','" + c[x].L.toString() + "','" + pregunta + "','" + respuesta + "')");
                    }
                }
            }
            websql.realiza().transaccionAsyncScript(arraydeInsercciones, callback);
        },
        recogeNiveles: function (c) {
            // c --> coleccionObjetosJson;
            var niveles = [];
            for (var x = 0; x < c.length; x++) {
                niveles.push(c[x].N.toString());
            }
            niveles = funciones.array().ordenayUnicos(niveles);
            return niveles.join(',');
        }

    };
};


