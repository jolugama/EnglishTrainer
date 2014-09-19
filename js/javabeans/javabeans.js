/**
 *  clase objeto de tabla para vocabulario y frases
 * @param {type} id
 * @param {type} tipo
 * @param {type} nivel
 * @param {type} lista
 * @param {type} pregunta
 * @param {type} respuesta
 * @returns {undefined}
 */
var javabeans = javabeans || {};
javabeans.tables = function() {
    return{
        TableGame: function(id, tipo, nivel, lista, pregunta, respuesta) {
            this.id = id || 0;
            this.tipo = tipo || '';
            this.nivel = nivel || 0;
            this.lista = lista || '';
            this.pregunta = pregunta || '';
            this.respuesta = respuesta || '';
        },
        // id_pregunta INTEGER,id_perfil INTEGER,correcto INTEGER,erroneo INTEGER,mark INTEGER,idioma TEXT,tipojuego INTEGER)"
        TableGameReg: function(idPregunta, idPerfil, correcto, erroneo, mark, idioma, tipoJuego) {
            this.idPregunta = idPregunta || 0;
            this.idPerfil = idPerfil || 0;
            this.correcto = correcto || 0;
            this.erroneo = erroneo || 0;
            this.mark = mark || 0;
            this.idioma = idioma || 'es';
            this.tipoJuego = tipoJuego || 1;
        }

    }

}
