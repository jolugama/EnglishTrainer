//'use strict';
//var db = window.openDatabase("jolugamaweb", "0.1", "My WebSQL test database", 5 * 1024 * 1024);
////db.changeVersion("0.1", "0.2", function(t) {
////    t.executeSql("create table ...");
////});
//
//function executeWebsqlScript(arrayExecutesSQL, funcionTransaccionCompletada) {
//    db.transaction(function(tx) {
//        for (var i = 0; i < arrayExecutesSQL.length; i++) {
//            eval("tx.executeSql(\"" + arrayExecutesSQL[i] + "\", [], onSuccess, onError)");
//        }
//    }, onError,
//            funcionTransaccionCompletada
//            );
//}
//
//
//
//function selectWebsql(sql, callback) {
//    var data = [];
//    db.transaction(function(tx) {
//        tx.executeSql(sql, [],
//                function(tx, resultado) {
//                    for (var i = 0; i < resultado.rows.length; i++) {
//                        var item = resultado.rows.item(i);
//                        data.push(item);
//                    }
//                    callback(data);
//                }
//        );
//    }, onError, onReadyTransaction);
//}
//
//
///**
// *
// * @param {type} sql
// * @param {type} displayResults  se debe pasar como argumentos(tx,results)
// * @returns {undefined}
// */
//function selectWebsql2(sql, displayResults) {
//    db.transaction(function(tx) {
//        eval("tx.executeSql(\"" + sql + "\", []," + displayResults + ", onError)");
//    },
//            onError,
//            onReadyTransaction
//            );
//}
//
//function selectRow(query, callBack) { // <-- extra param
//    var result = [];
//    db.transaction(function(tx) {
//        tx.executeSql(query, [], function(tx, rs) {
//            for (var i = 0; i < rs.rows.length; i++) {
//                var row = rs.rows.item(i)
//                result[i] = {id: row['id'],
//                    pregunta: row['pregunta']
//                }
//            }
//            console.log(result);
//            callBack(result); // <-- new bit here
//        }, errorHandler);
//    });
//}
//
//
//function displayResults(tx, results) {
//    if (results.rows.length === 0) {
//        alert("No se ha encontrado registros");
//        return false;
//    }
//    for (var i = 0; i < results.rows.length; i++) {
//        var row = results.rows.item(i);
//        console.log(row.id + " " + row.pregunta + " " + row.respuesta);
//    }
//}
//
//
//function executeWebsql(StringExecuteSQL) {
//    db.transaction(function(tx) {
//        tx.executeSql(StringExecuteSQL);
//    });
//}
//
//function onReadyTransaction() {
//    console.log('Transacción completada');
//}
//
//
//function onSuccess(tx, results) {
//    console.log('Execute SQL completada');
//}
//
//
//
//function onError(err) {
//    console.log("error: " + err);
//}
//
////function displayResults(tx, results) {
////    if (results.rows.length === 0) {
////        alert("No se ha encontrado registros");
////        return false;
////    }
////
////    var rows = "<table> <tr><th>Id_reg</th><th>Id_pregunta</th><th>Id_perfil</th><th>Correcto</th><th>Erroneo</th><th>Marca</th><th>Idioma</th><th>TipoJuego</th></tr>";
////    for (var i = 0; i < results.rows.length; i++) {
////        var row = results.rows.item(i);
////        rows += "<tr><td> " + row.id_reg + "</td><td>" + row.id_pregunta + "</td><td>" + row.id_perfil + "</td><td>" + row.correcto + "</td><td>" + row.erroneo + "</td><td>" + row.mark + "</td><td>" + row.idioma + "</td><td>" + row.tipojuego + "</td></tr>";
////    }
////    document.getElementById("miid2").innerHTML = rows;
////}
//
////db.transaction(
////        function(tx) {
////            tx.executeSql("SELECT * FROM GAME_REG WHERE id_reg > ?", ['0'], displayResults, onError);
////        }, onError, onReadyTransaction
////        );
//
