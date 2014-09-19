'use strict';
/**
 * Funciones de json
 * @type @exp;jsonFunctions
 */
var jsonFunctions = jsonFunctions || {};
/**
 * Recoge Json de archivo y lo vuelca en variable. Mediante AJAX.
 * @param {type} url archivo Json
 * @param {type} funcion de vuelta
 * @returns {GenerarJsonAjax.objeto|XMLHttpRequest}
 */
jsonFunctions.generarJsonAjax = function(url, funcion) {
    var objeto = new XMLHttpRequest();
    objeto.open('get', url, true);
    objeto.setRequestHeader("Content-type", "application/json");
    objeto.onreadystatechange = function() {
        if (objeto.readyState === 4) {
            funcion();
        }
    };
    objeto.send();
    return objeto;
}







