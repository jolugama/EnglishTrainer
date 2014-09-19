'use strict';
var funciones = funciones || {};
funciones.sonidosArray = [0, 1, 2];
funciones.posicionSonido = -1;

funciones.array = function() {
    return{
        ordenayUnicos: function(arr) {
            //primero lo ordeno
            arr = funciones.array().ordena(arr);

            arr = arr.sort();
            var ret = [arr[0]];
            for (var i = 1; i < arr.length; i++) { // start loop at 1 as element 0 can never be a duplicate
                if (arr[i - 1] !== arr[i]) {
                    ret.push(arr[i]);
                }
            }
            return ret;
        },
        ordena: function(arr) {
            arr = arr.sort(function(a, b) {
                return a - b;
            });
            return arr;
        },
        desordena: function(arr) {
            var result;
            var contador = 0;
            do {
                contador += 1;
                result = arr.sort(function() {
                    return Math.random() - 0.5;
                });
                if (contador > 4) {
                    return result;
                }
            } while (arr === result);

            return result;
        }
    };
};

funciones.numeros = function() {
    return{
        random: function(numeroMaximo) {
            var num = Math.floor((Math.random() * numeroMaximo));
            return num;
        }
    };
};

funciones.config = function() {
    return{
        /**
         *
         * @param {type} tipoDispositivo movil,android
         * @returns {resultado|Boolean}
         */
        tipoDispositivo: function(tipoDispositivo) {
            var resultado = false;
            if (tipoDispositivo === "movil") {
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
                    resultado = true;
                }
            } else if (tipoDispositivo === "android") {
                if (/Android/i.test(navigator.userAgent)) {
                    resultado = true;
                }
            }
            return resultado;
        },
        ocultaBarra: function() {
            if (!window.location.hash)
            {
                if (document.height < window.outerHeight + 10)
                {
                    document.body.style.height = (window.outerHeight + 50) + 'px';
                }

                setTimeout(function()
                {
                    window.scrollTo(0, 1);
                }, 50);
            }

        }
    };
};

/**
 * 2 opciones. si se indica numero en el argumento, se escucha una voz especifica de 0 a 2, o aleatorio por el método
 * @returns {funciones.sonidos.Anonym$3}
 */
funciones.sonidos = function() {
    return{
        /**
         *
         * @param {type} idioma en es
         * @param {type} texto
         * @returns {undefined} responde con sonido
         */
        habla: function(idioma, texto) {
            try {

                var txt;
                if (texto.slice(0, 1) !== '¿' && texto.slice(0, 1) !== '¡') {
                    txt = texto.slice(0, 1).toUpperCase() + texto.slice(1, texto.length).toLowerCase();
                } else {
                    txt = texto.slice(0, 2).toUpperCase() + texto.slice(2, texto.length).toLowerCase();
                }
//                console.log(txt);
                var voz = new SpeechSynthesisUtterance();
                var voices = window.speechSynthesis.getVoices();
                voz.text = txt;
                if (idioma.toLowerCase() === "es") {
                    voz.lang = 'es-ES';
                } else if (idioma.toLowerCase() === "en") {
                    funciones.posicionSonido += 1;
                    if (funciones.sonidosArray[funciones.posicionSonido] === undefined) {
                        funciones.posicionSonido = 0;
                    }
//                console.log(funciones.sonidosArray[funciones.posicionSonido])
                    if (funciones.sonidosArray[funciones.posicionSonido] === 0) {
                        voz.voice = voices.filter(function(voice) {
                            return voice.name === 'Google UK English Female';
                        })[0];
                    } else if (funciones.sonidosArray[funciones.posicionSonido] === 1) {
                        voz.voice = voices.filter(function(voice) {
                            return voice.name === "Google UK English Male";
                        })[0];
                    } else if (funciones.sonidosArray[funciones.posicionSonido] === 2) {
                        voz.voice = voices.filter(function(voice) {
                            return voice.name === "Google US English";
                        })[0];
                    }
                    if (funciones.config().tipoDispositivo("movil") === true) {
                        //habla.lang = 'en-GB';
                        voz.lang = 'en-US';
                    }
                }
                speechSynthesis.speak(voz);
//            speechSynthesis.getVoices().forEach(function(voice) {
//                console.log(window.speechSynthesis.getVoices());
//            });
            } catch (e) {
                console.log("incidencia en metodo habla")
            }
        }
    };

};

funciones.json = function() {
    return{
        /**
         * transforma string a formato json de objetos. (que viene de ajax)
         * @param {type} mistring
         * @returns {Array|Object}
         */
        stringToJson: function(mistring) {
            var objetosJson = [];
            mistring = mistring.replace(/\'/g, "\"");
            //console.log(mistring)
            objetosJson = JSON.parse(mistring);
            return objetosJson;
        },
        stringToJson2: function(mistring) {
            var objetosJson = [];
            var mistring = mistring.replace(/'/g, "\\\""); //todas las " las paso a comillas simple
            objetosJson = JSON.parse(mistring);
            return objetosJson;
        }
    }
}

funciones.tiempo = function() {
    return{
        sleep: function(milliseconds) {
            var start = new Date().getTime();
            for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds) {
                    break;
                }
            }
        }
    };
};


