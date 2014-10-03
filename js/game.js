'use strict';
/**
 *
 * @type @exp;game
 */
var game = game || {};
websql.crear().dataBaseAsync("jolugamaweb", "0.1", "English Trainer - JoLuGaMa Web", 5 * 1024 * 1024);
game.cuestionario = [];
game.felicitaciones = [];
game.pos = -1;
game.posFelicitacion = -1;
game.colorTexto;
game.tiempoFinRonda = 4000;
game.tiempoPregunta = 1200;
game.tiempoPasar = 5000;
game.duration = 9000;
game.preguntaFallida = false; //si se pulsa botones como ayuda o sonido la respuesta tomará como fallo, aunque acierte.
//game.pulsadoAyuda = false; //sirve para si se ha pulsado ayuda, la respuesta, en vez de correcta, va a ser erronea, aunque lo escribas bien.
game.estadoTiempoIniciado = false;
game.corregida = false; //cuando se ha insertado como error o como acierto, se pone a true
game.tiempoVocabulario = 12;
game.tiempoIrregulares = 20;
game.tiempoFrases = 27;
$(document).ready(function() {
    $('body').hide();
    $('body').fadeIn(3000);
});
/*
 * carga datos al iniciar.
 */
$(window).on('load', function() {
    document.querySelector("#escrito").spellcheck = false; //para navegadores con control de ortografia. se desactiva.
    game.config().vuelveFoco();
    game.config().leeDatos();
    game.colorTexto = $("#escrito").css('color');
//en moviles la primera vez se atranca el sonido. se fuerza para que se prepare.
    funciones.sonidos().habla("en", ".");
    funciones.sonidosArray = funciones.array().desordena(funciones.sonidosArray);
    //workaround: reviso errores cada segundo. Esto es porque en android, el retroceso no lo cuenta como tecla pulsada.
    setInterval("game.accion().actualizaErrores()", 1000);

});
/**
 * Todo lo relacionado con el inicio de listas, botoneras, etc en el programa
 * @returns {game.config.Anonym$1}
 */
game.config = function() {
    return{
        /**
         * carga los datos de sesión, cuestionario, felicitaciones y imprime la primera pregunta.
         * @returns {undefined}
         */
        leeDatos: function() {
            var nivel = localStorage.etNivel;
            var lista = localStorage.etLista;
            var tipoJuego = localStorage.etTipoJuego;
            var tabla;
            var tipo;
            if (tipoJuego === 'Vocabulary') {
                tabla = "GAME_VOC_ING";
                tipo = "v";
                if (!lista.indexOf('IRREG')) {
                    game.temporizador().iniciaTiempo(game.tiempoVocabulario);
                } else {
                    game.temporizador().iniciaTiempo(game.tiempoIrregulares);
                }

            } else if (tipoJuego === 'Phrases') {
                tabla = "GAME_FRA_ING";
                tipo = "p";
                game.temporizador().iniciaTiempo(game.tiempoFrases);
            }



            game.cuestionario = new Array();
            var query;
            if (lista !== 'Wrongs' && lista !== 'Marks') {
                query = "SELECT * FROM " + tabla + " where nivel='" + nivel + "' and lista='" + lista + "'";
            } else if (lista === 'Wrongs') {
                query = "SELECT * FROM GAME_REG left outer join " + tabla + " ON " + tabla + ".id=GAME_REG.id where tipojuego='" + tipo + "' and nivel='" + nivel + "' and (correcto - erroneo)<=0";
            } else if (lista === 'Marks') {
                query = "SELECT * FROM GAME_REG left outer join " + tabla + " ON " + tabla + ".id=GAME_REG.id where tipojuego='" + tipo + "' and nivel='" + nivel + "' and mark=1";
            }
            websql.realiza().transaccionAsync(query, function(datos) {
                game.cuestionario = datos;
                if (tipoJuego === 'Vocabulary') {
                    game.cuestionario = funciones.array().desordena(game.cuestionario); //desordeno la secuencia de las preguntas en vocabulario
                } else if (tipoJuego === 'Phrases') {
                    if (lista === 'Wrongs' || lista === 'Marks') {
                        game.cuestionario = funciones.array().desordena(game.cuestionario);
                    }
                }

                game.accion().imprimirPregunta();
            });
            game.felicitaciones = new Array();
            websql.realiza().transaccionAsync("SELECT * FROM GAME_VOC_ING where nivel=1 and lista='FELICITACIONES' ", function(datos) {
                game.felicitaciones = datos;
                game.felicitaciones = funciones.array().desordena(game.felicitaciones);
            });
            // var sqlResultSet = window.sqlTransactionSync.executeSql("SELECT * FROM " + tabla + " where nivel=" + nivel + " and lista='" + lista + "'", []);

            // console.log(cuestionario[8].pregunta)
            //imprimePregunta();

            if (localStorage.etModoJuego) {
                document.getElementById("modoJuego").value = localStorage.etModoJuego;
            }

        },
        /**
         * para boton de regresar al inicio
         * @returns {undefined}
         */
        goBack: function() {
            window.location.href = 'index.html';
        },
        botonAyuda: function() {
            game.preguntaFallida = true;
            document.getElementById("bhelp").disabled = "disabled";
            document.getElementById("respuesta").innerHTML = game.cuestionario[game.pos].respuesta;
        },
        botonSpeak: function() {
            game.preguntaFallida = true;
            document.getElementById("bspeak").disabled = "disabled";
//            funciones.sonidos().habla("es", game.cuestionario[game.pos].pregunta);
            funciones.sonidos().habla("en", game.cuestionario[game.pos].respuesta);
            setTimeout(function() {
                document.getElementById("bspeak").disabled = "";
            }, 2500);
        },
        /**
         * vuelve el foco siempre a lo que se esté escribiendo
         * @returns {undefined}
         */
        vuelveFoco: function() {
            document.getElementById('escrito').focus();
        },
        /**
         * Todos los componentes necesarios activados
         * @returns {undefined}
         */
        enableTagHtml: function() {
            document.getElementById('errores').innerHTML = "";
            document.getElementById("escrito").disabled = false;
            document.getElementById("escrito").readOnly = false;
            document.getElementById("escrito").value = "";
            document.getElementById("bpasar").disabled = "";
            document.getElementById('escrito').style.color = game.colorTexto;
            document.getElementById("bhelp").disabled = "";
            document.getElementById("bspeak").disabled = "";
            game.config().vuelveFoco();
        },
        /**
         * Todos los componentes necesarios desactivados
         * @returns {undefined}
         */
        disableTagHtml: function() {
            document.getElementById("escrito").disabled = true;
            document.getElementById("escrito").readOnly = true;
            document.getElementById("bpasar").disabled = "disabled";
            document.getElementById("bhelp").disabled = "disabled";
            document.getElementById("bspeak").disabled = "disabled";
        },
        /**
         * Segun la lista de la derecha arriba, hay varios tipos de juego.
         * segun el juego la respuesta puede estar codificada, alterada aleatoriamente, oculta, o hablada.
         * @returns {undefined}
         */
        modoJuego: function() {
            game.temporizador().paraTiempo();
            var modoJuego = document.getElementById("modoJuego").value.toLowerCase();
            if (modoJuego === 'normal') {
                document.getElementById("respuesta").innerHTML = game.string().encripta(game.cuestionario[game.pos].respuesta);
            } else if (modoJuego === 'pellmell') {
                document.getElementById("respuesta").innerHTML = game.string().encriptaPellmell(game.cuestionario[game.pos].respuesta);
            } else if (modoJuego === 'hidden') {
                document.getElementById("respuesta").innerHTML = "";
            } else if (modoJuego === 'talk') {
                document.getElementById("respuesta").innerHTML = "";
                if (funciones.config().tipoDispositivo("movil") === false) {
                    funciones.sonidos().habla("es", game.cuestionario[game.pos].pregunta);
                }
                funciones.sonidos().habla("en", game.cuestionario[game.pos].respuesta);
            }

            if (modoJuego === 'timeless') {
                document.getElementById("respuesta").innerHTML = game.string().encripta(game.cuestionario[game.pos].respuesta);
                game.temporizador().paraTiempo();
            } else {
                // game.temporizador().reiniciaTiempo();
            }
            localStorage.etModoJuego = document.getElementById("modoJuego").value;
        },
        clickTiempo: function() {
            if (game.estadoTiempoIniciado === false) {
                game.temporizador().reiniciaTiempo();
            } else {
                game.temporizador().paraTiempo();
            }
        }
    };
};
game.accion = function() {
    return {
        imprimirPregunta: function() {
            try {
                game.corregida = false;
                game.preguntaFallida = false; //en cada pregunta vuelve a su estado inicial.
                game.pos += 1;
                //si llega al final, vuelve al principio
                if (game.cuestionario[game.pos] === undefined) {
                    game.pos = 0;
                }
                var mipregunta = game.cuestionario[game.pos].pregunta;
                mipregunta = mipregunta.replace(',', ', ');
                document.getElementById("pregunta").innerHTML = mipregunta;
                //segun el modo de juego la respuesta se verá encriptada, letras desordenadas, oculta, hablada.
                game.config().modoJuego();
                game.config().enableTagHtml();
                document.getElementById("infoPos").innerHTML = game.pos + 1 + " of " + game.cuestionario.length;
                game.accion().comprobarCheck();
                //para dispositivos móviles, la lista si supera x digitos se acorta
                if (funciones.config().tipoDispositivo("movil") === true) {
                    var milista = localStorage.etLista;
                    if (milista.length > 9) {
                        milista = milista.slice(0, 9);
                        milista += "...";
                    }
                    var minivel = localStorage.etNivel;
                    
                    if(minivel.indexOf("Books: ")>=0){
                        
                        minivel=minivel.substring(7,minivel.length);
                    }
                    if (minivel.length > 11) {
                        minivel = minivel.slice(0, 11);
                        minivel += "...";
                    }

                    document.getElementById("infoLista").innerHTML = minivel + " - " + milista;
                } else {
                    document.getElementById("infoLista").innerHTML = "Level " + localStorage.etNivel + " - List " + localStorage.etLista + " - Id " + game.cuestionario[game.pos].id;
                    //si no es movil, dejo 2 lineas vacias para mejora de visualización, en pregunta.
                    document.getElementById("sinPreguntas").innerHTML = "<br><br>"
                }
                var modoJuego = document.getElementById("modoJuego").value.toLowerCase();
                if (modoJuego !== 'timeless') {
                    game.temporizador().reiniciaTiempo();
                }

            } catch (e) {
                document.getElementById("sinPreguntas").innerHTML = "Ooops!. No questions available";
                $('#formulario').hide();
            }

        },
        comprobarCheck: function() {
            try {
                var id = game.cuestionario[game.pos].id;
                var t = localStorage.etTipoJuego;
                var tipojuego;
                if (t === 'Vocabulary') {
                    tipojuego = "v";
                } else if (t === 'Phrases') {
                    tipojuego = "p";
                }

                websql.realiza().transaccionAsync("select id,mark from GAME_REG where id=" + id + " and tipojuego='" + tipojuego + "'",
                        function(datos) { //1º callback. guardadatos
                            try {
                                if (datos[0].mark === 1) {
                                    $("#mark").prop("checked", "checked");
                                } else {
                                    $("#mark").prop("checked", "");
                                }
                            } catch (ee) {
                                $("#mark").prop("checked", "");
                            }
                        }, null);
            } catch (e) {
                //console.log(e.message);
            }
        },
        imprimeFelicitacion: function() {
            try {
                game.posFelicitacion += 1;
                if (game.felicitaciones[game.posFelicitacion] === undefined) {
                    game.posFelicitacion = -1;
                }
                var txt = game.felicitaciones[game.posFelicitacion].respuesta + " <span style='font-size: 0.8em'>(" + game.felicitaciones[game.posFelicitacion].pregunta + ")</span>";
                return txt;
            } catch (e) {
                //si por alguna razón no se insertó en la websql las felicitaciones, o por otras razones
                return "ok!";
            }

        },
        /**
         * Si al pasar o al corregir es la ultima pregunta, deribar a este método, en vez de imprimir pregunta. El mismo después lo llama
         * @returns {undefined}
         * @param {type} pasar si true, el tiempo sera de pasar. si false, el tiempo es de una pregunta normal.
         */
        finDeRonda: function(pasar) {
            //desordeno de nuevo
            var tipoJuego = localStorage.etTipoJuego;
            var lista = localStorage.etLista;
            if (tipoJuego === 'Vocabulary') {
                game.cuestionario = funciones.array().desordena(game.cuestionario); //desordeno la secuencia de las preguntas en vocabulario
            } else if (tipoJuego === 'Phrases') {
                if (lista === 'Wrongs' || lista === 'Marks') {
                    game.cuestionario = funciones.array().desordena(game.cuestionario);
                }
            }

            game.config().disableTagHtml();

            if (lista !== 'Wrongs' && lista !== 'Marks') {
                document.getElementById("errores").innerHTML += " <div style='font-size:1.4em;color:blue;'>You're finished the round</div>";
                setTimeout(game.accion().imprimirPregunta, game.tiempoFinRonda);
            } else {
                if (pasar === true) {
                    setTimeout(game.accion().imprimirPregunta, game.tiempoPasar);
                } else {
                    setTimeout(game.accion().imprimirPregunta, game.tiempoPregunta);
                }
            }

        },
        pasar: function() {
            game.temporizador().paraTiempo();
            document.getElementById('respuesta').innerHTML = game.cuestionario[game.pos].respuesta;
            game.config().disableTagHtml();
            var modoJuego = document.getElementById("modoJuego").value.toLowerCase();
            if (modoJuego !== 'talk') {
                funciones.sonidos().habla("en", game.cuestionario[game.pos].respuesta);
            }
            game.accion().insertaFallo();

        },
        insertaAcierto: function() {
            game.accion().insertaRegistro(true, function() {
                console.log("acierta " + game.cuestionario[game.pos].pregunta);
                //si la proxima es fin de ronda... , de lo contrario siguiente pregunta
                if (game.cuestionario[game.pos + 1] === undefined) {
                    game.accion().finDeRonda(false);
                } else {
                    setTimeout(game.accion().imprimirPregunta, game.tiempoPregunta);
                }
            });
        },
        insertaFallo: function() {
            game.accion().insertaRegistro(false, function() {
                console.log("falla " + game.cuestionario[game.pos].pregunta);
                //si la proxima es fin de ronda... , de lo contrario siguiente pregunta
                if (game.cuestionario[game.pos + 1] === undefined) {
                    game.accion().finDeRonda(true);
                } else {
                    setTimeout(game.accion().imprimirPregunta, game.tiempoPasar);
                }
            });
        },
        corrige: function(event) {
            if (game.corregida === false) {
                var modoJuego = document.getElementById("modoJuego").value.toLowerCase();
                //shortcuts
                if (event.shiftKey) {
                    var pulsado = String.fromCharCode(event.keyCode || event.charCode);
                    var txt = document.getElementById('escrito').value;
                    var txt2 = txt.substr(0, txt.length - 1);
                    if (pulsado.toString().toLowerCase() === "s") {
//                        game.temporizador().paraTiempo();
                        game.config().botonSpeak();
                        document.getElementById('escrito').value = txt2;
                    } else if (pulsado.toString().toLowerCase() === "h") {
//                        game.temporizador().paraTiempo();
                        game.config().botonAyuda();
                        document.getElementById('escrito').value = txt2;
                    } else if (pulsado.toString().toLowerCase() === "m") {
//                        game.temporizador().paraTiempo();
                        if ($("#mark").prop("checked")) {
                            $("#mark").prop("checked", "");
                        } else {
                            $("#mark").prop("checked", "checked");
                        }
                        document.getElementById('escrito').value = txt2;
                    }
                }
                if (event.keyCode == 27) {  //si se pulsa escape
                    game.corregida = true;
                    game.accion().pasar();
                }

                if (game.cuestionario[game.pos] !== undefined) { //si existe respuesta...
                    //verifica errores
                    document.getElementById('errores').innerHTML = game.string().verificaErrores(game.cuestionario[game.pos].respuesta, document.getElementById("escrito").value);
                    //si es igual la respuesta a lo escrito
                    if (game.string().esIgual(game.cuestionario[game.pos].respuesta, document.getElementById("escrito").value) === true) {
                        game.temporizador().paraTiempo();
                        document.getElementById("escrito").disabled = true;
                        document.getElementById("escrito").readOnly = true;
                        document.getElementById('errores').style.color = "green";
                        //document.getElementById('errores').innerHTML = "OK!";
                        document.getElementById('errores').innerHTML = game.accion().imprimeFelicitacion();
                        document.getElementById('respuesta').innerHTML = game.cuestionario[game.pos].respuesta;
                        game.config().disableTagHtml();

                        if (game.preguntaFallida === false) {
                            game.accion().insertaAcierto();
                            game.corregida = true;
                        } else {
                            //console.log("fallada");
                            if (modoJuego !== 'talk') {
                                funciones.sonidos().habla("en", game.cuestionario[game.pos].respuesta);
                            }
                            game.accion().insertaFallo();
                            game.corregida = true;
                        }

                    } else {
                        document.getElementById('errores').style.color = "red";
                        if (modoJuego !== 'timeless') {
                            if (game.estadoTiempoIniciado === false && game.corregida === false) {

                                game.temporizador().reiniciaTiempo();
                            }
                        }
                    }
                }
            }
        },
        actualizaErrores: function() {
            if (document.getElementById("escrito").disabled === false) {  //para que si es findeRonda, si se desordena de nuevo no haga cosas raras
                try {
                    //mientras no sea correcta la respuesta(para que no se ejecute 2 veces)
                    if (game.string().esIgual(game.cuestionario[game.pos].respuesta, document.getElementById("escrito").value) !== true) {
                        document.getElementById('errores').innerHTML = game.string().verificaErrores(game.cuestionario[game.pos].respuesta, document.getElementById("escrito").value);
                        //document.getElementById('escrito').style.color = game.colorTexto;
                    }
                } catch (e) {
                }
            }
        },
        insertaRegistro: function(escorrecto, callback) {
            var id = game.cuestionario[game.pos].id;
            var t = localStorage.etTipoJuego;
            var tipojuego;
            var tabla;
            if (t === 'Vocabulary') {
                tipojuego = "v";
                tabla = "GAME_VOC_ING";
            } else if (t === 'Phrases') {
                tipojuego = "p";
                tabla = "GAME_FRA_ING";
            }
            var idioma = 'en';
            var misdatos = [];
            var correcto;
            var erroneo;
            var mark = 0;
            if ($("#mark").prop("checked")) {
                mark = 1;
            }

            websql.realiza().transaccionAsync("select * from GAME_REG where id=" + id + " and tipojuego='" + tipojuego + "'",
                    function(datos) { //1º callback. guardadatos
                        misdatos = datos;
                        //console.log(datos)
                    }, function() {  //2º callback. fin de la transaccion
                if (misdatos.length === 0) {
                    if (escorrecto === true) {
                        correcto = 1;
                        erroneo = 0;
                    } else {
                        correcto = 0;
                        erroneo = 1;
                    }
                } else {

                    if (escorrecto === true) {
                        correcto = misdatos[0].correcto + 1;
                        erroneo = misdatos[0].erroneo;
                    } else {
                        correcto = misdatos[0].correcto;
                        erroneo = misdatos[0].erroneo + 1;
                    }
                }
                //si no existe, se inserta
                if (misdatos.length === 0) {
                    websql.realiza().transaccionAsync("insert into GAME_REG(id, tipojuego, idioma, correcto, erroneo, mark) values(" + id + ",'" + tipojuego + "','" + idioma + "'," + correcto + "," + erroneo + "," + mark + ")", callback);
                } else { //si existe se actualiza
                    websql.realiza().transaccionAsync("update GAME_REG set correcto=" + correcto + ",erroneo=" + erroneo + ", mark=" + mark + " Where id=" + id + " and tipojuego='" + tipojuego + "' ", callback);
                }

            });
        }


    };
};
game.string = function() {
    return {
        encripta: function(texto) {
            var resultado = "";
            for (var i in texto) {
                if (texto[i] === ' ') {
                    resultado += '&nbsp&nbsp';
                } else if (texto[i] === "'" || texto[i] === "." || texto[i] === "," || texto[i] === "?" || texto[i] === "¿" || texto[i] === "(" || texto[i] === ")" || texto[i] === "%" || texto[i] === "$" || texto[i] === "¡" || texto[i] === "!" || texto[i] === "-" || texto[i] === "&") {
                    resultado += texto[i];
                } else {
                    resultado += '_ ';
                }
            }
            return resultado;
        },
        encriptaPellmell: function(texto) {
            var arrayTexto = [];
            arrayTexto = texto.split(" ");
            arrayTexto = funciones.array().desordena(arrayTexto);
            if (arrayTexto.length < 3 || (arrayTexto[0] === 'to' && arrayTexto.length < 4)) {
                for (var i = 0; i < arrayTexto.length; i++) {
                    var arrayPalabra = arrayTexto[i].split('');
                    arrayPalabra = funciones.array().desordena(arrayPalabra);
                    arrayTexto[i] = arrayPalabra.join('').toString();
                }
            }

            return arrayTexto.join(' ').toString();
        },
        verificaErrores: function(textoOriginal, textoaComparar) {
            var errores = 0;
            try {
                for (var i in textoaComparar) {
                    if (textoaComparar[i].toLowerCase() === ' ' && textoOriginal[i].toLowerCase() === "'") {
                        //console.log("este es el caso")
                        textoaComparar[i] = "'";
                        var txt = document.getElementById('escrito').value;
                        var txt2 = txt.substr(0, txt.length - 1);
                        document.getElementById('escrito').value = txt2 + "'";
                        return '';
                    }
                    if (textoaComparar[i].toLowerCase() !== textoOriginal[i].toLowerCase()) {
                        errores += 1;
                    }
                }
                if (errores === 0) {
                    errores = '';
                    document.getElementById('escrito').style.color = game.colorTexto;
                    //document.getElementById('escrito').style.color = "black";
                } else if (errores === 1) {
                    errores += " error";
                    document.getElementById('escrito').style.color = "red";
                } else {
                    document.getElementById('escrito').style.color = "red";
                    errores += " errors";
                }
            } catch (e) {
                errores = "Heeey!!!";
            }

            return errores;
        },
        esIgual: function(str1, str2) {
            //0 si es igual
            if (str1.toLowerCase().localeCompare(str2.toLowerCase()) === 0) {
                return true;
            } else {
                return false;
            }
        }
    };
};
game.temporizador = function() {
    return{
        iniciaTiempo: function(tiempo) {
            if (funciones.config().tipoDispositivo("movil") === true) {
                tiempo += 8; //se da más tiempo por ser dispositivo móvil
            }
            $('#timer').pietimer({
                timerSeconds: tiempo,
                //color: '#3071a9',
                color: '#ccc',
                fill: false,
                showPercentage: true,
                callback: function() {
                    //que hacer aqui
                    $('#cuerpo').css('background-color', '#F3F3F3');
                    if (funciones.config().tipoDispositivo("movil") === false) {
                        game.preguntaFallida = true;
                    }
                }, timerCurrent: 0
            });
            $('#timer').pietimer('reset');
        },
        reiniciaTiempo: function() {
            $('#timer').css('color', '#ccc');
            $('#cuerpo').css('background-color', '#FFF');
//    $('#timer').hide();
//    $('#timer').fadeIn(7000);
            $('#timer').pietimer('start');
            game.estadoTiempoIniciado = true;
        },
        paraTiempo: function() {
            $('#cuerpo').css('background-color', '#FFF');
            $('#timer').css('color', '#FFF');
            // $('#timer').pietimer('stopWatch');
            $('#timer').pietimer('reset');
            game.estadoTiempoIniciado = false;
        }
    };
};




