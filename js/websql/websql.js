'use strict';
/**
 * Todo lo relacionado con websql.
 * @type @exp;websql
 */
var websql = websql || {};
websql.db;
/**
 * Namespace websql
 * @returns {websql.create.Anonym$0}
 */
websql.crear = function() {

    return{
        dataBaseAsync: function(name, version, displayName, size) {
            try {
                websql.db = openDatabase(name, version, displayName, size, function(database)
                {
                    console.log("abre database async");
                });
            } catch (e) {
            }
        },
        dataBaseSync: function(name, version, displayName, size) {
            try {
                websql.db = openDatabaseSync(name, version, displayName, size, function(databaseSync)
                {
                    console.log("abre database sync");
                });
            } catch (e) {
            }
        }
    };
};

websql.realiza = function() {
    return{
        /**
         * para hacer insercciones, select, update, deletes.
         * Se indica consulta, funcion donde grabará el array de solución, función donde irá después de que termine todo.
         * @param {type} query
         * @param {type} callbackGuardaDatosArray. Usa 1 parametro.   ej: function(datos) {variableGlobal = datos;}
         * @param {type} callbackFinTransaccion.
         * @returns {undefined}
         */
        transaccionAsync: function(query, callbackGuardaDatosArray, callbackFinTransaccion) {
            var datos = [];
            websql.db.transaction(function(t) {
                t.executeSql(query, [],
                        function(t, resultado) {
                            for (var i = 0; i < resultado.rows.length; i++) {
                                var item = resultado.rows.item(i);
                                datos.push(item);
                            }
                            callbackGuardaDatosArray(datos);
                        }, websql.mensajes().onError
                        );
            }, websql.mensajes().onError, callbackFinTransaccion);
        },
        transaccionSync: function(query, callback) {  //realizado por mi, PROBAR
            var data = [];
            websql.db.transaction(function(sqlTransactionSync) {
                var sqlResultSet = sqlTransactionSync.executeSql(query, []);
                callback(sqlResultSet);
            }, function()
            {
                console.log("SQL statements were executed successfully.");
            });
        },
        transaccionAsyncScript: function(arrayExecutesSQL, funcionTransaccionCompletada) {
            websql.db.transaction(function(t) {
                for (var i = 0; i < arrayExecutesSQL.length; i++) {
                    //console.log(i + " t.executeSql(\"" + arrayExecutesSQL[i] + "\", [], websql.mensajes().onSuccess, websql.mensajes().onError)");
                    eval("t.executeSql(\"" + arrayExecutesSQL[i] + "\", [], websql.mensajes().onSuccess, websql.mensajes().onError)");
                }
            }, websql.mensajes().onError, funcionTransaccionCompletada);
        },
        transaccionSyncScript: function(arrayExecutesSQL, funcionTransaccionCompletada) {
            websql.db.sqlTransactionSync(function(t) {
                for (var i = 0; i < arrayExecutesSQL.length; i++) {
                    //console.log(i + " t.executeSql(\"" + arrayExecutesSQL[i] + "\", [], websql.mensajes().onSuccess, websql.mensajes().onError)");
                    eval("t.executeSql(\"" + arrayExecutesSQL[i] + "\", [], websql.mensajes().onSuccess, websql.mensajes().onError)");
                }
            }, websql.mensajes().onError, funcionTransaccionCompletada);
        },
        query: function(StringExecuteSQL) {
            websql.db.transaction(function(t) {
                t.executeSql(StringExecuteSQL);
            });
        }

    };
};


websql.mensajes = function() {
    return{
        onError: function(t, e) {
            try {
                console.log("error: " + e.message);
            } catch (e2) {
                try {
                    console.log("error: " + t.message);
                } catch (e3) {
                    console.log("error no definido");
                }

            }

        },
        onSuccess: function(t, results) {
            console.log('Execute SQL completada');
        }
    };
};



