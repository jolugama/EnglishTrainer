'use strict';
var statistics = statistics || {};
websql.crear().dataBaseAsync("jolugamaweb", "0.1", "English Trainer - JoLuGaMa Web", 5 * 1024 * 1024);

statistics.mipie;
statistics.mibar;

$(document).ready(function () {
    if (localStorage.etTipoJuego === 'Vocabulary') {
        document.getElementById('tipoJuego').selectedIndex = 0;
    } else {
        document.getElementById('tipoJuego').selectedIndex = 1;
    }

});


window.onload = function () {
    statistics.accion().estadoSelectTipoJuego();
};


statistics.config = function () {
    return{
        goBack: function () {
            window.location.href = 'index.html';
        }
    };
};

statistics.accion = function () {
    return{
        estadoSelectTipoJuego: function () {

            var tabla;
            var tipojuego;
            var misNiveles;

            var tipoJuego = document.getElementById("tipoJuego").value.toLowerCase();
            if (tipoJuego === 'vocabulary') {
                tabla = "GAME_VOC_ING";
                tipojuego = "v";
                misNiveles = localStorage.etNivelesVocabularioIngles;
            } else {
                tabla = "GAME_FRA_ING";
                tipojuego = "p";
                misNiveles = localStorage.etNivelesFrasesIngles;
            }



            var consulta = " select sum(correcto) as correcto,sum(erroneo) as erroneo, nivel  from "
                    + " (SELECT " + tabla + ".TIPO,ifnull(correcto,0) as correcto,ifnull(erroneo,0) as erroneo,nivel FROM " + tabla + "  "
                    + " left OUTER JOIN (select * from GAME_REG where tipojuego='" + tipojuego + "') as tabla on " + tabla + ".ID=tabla.ID "
                    + ")supertabla group by nivel order by nivel";
            var arrayNiveles = [];
            try {
                websql.realiza().transaccionAsync(consulta,
                        function (datos) {

                            var arrayAciertos = [];
                            var arrayFallos = [];
                            var totalAciertos = 0;
                            var totalFallos = 0;

                            var niveles = misNiveles.split(",");

                            for (var j = 0; j < niveles.length; j++) {
                                arrayNiveles.push(niveles[j])

                                var encontrado = false;
                                for (var i = 0; i < datos.length; i++) {
                                    if (datos[i].nivel === niveles[j]) {
                                        arrayAciertos.push(datos[i].correcto);
                                        arrayFallos.push(datos[i].erroneo);
                                        totalAciertos += datos[i].correcto;
                                        totalFallos += datos[i].erroneo;
                                        encontrado = true;
                                        break;
                                    } 

                                }
                                if (encontrado === true) {
                                    encontrado = false;
                                }else{
                                    arrayAciertos.push(0);
                                    arrayFallos.push(0);
                                }

                            }
                            
                            
//                            //para cuando se carga y aun no hay aciertos y fallos, que se vea bonito.
//                            if(totalAciertos===0 && totalFallos===0){
//                                totalAciertos=1;
//                                totalFallos=1;
//                            }
                         


                            //console.log(totalAciertos);
                            var pieData = [
                                {
                                    value: totalFallos,
                                    color: "#F7464A",
                                    highlight: "#FF0000",
                                    label: "Wrong"
                                },
                                {
                                    value: totalAciertos,
                                    color: "#46FF46",
                                    highlight: "#00FF00",
                                    label: "Right"
                                }
                            ];

                            var barChartData = {
                                labels: arrayNiveles,
                                datasets: [
                                    {
                                        fillColor: "rgba(0,220,0,0.5)",
                                        strokeColor: "rgba(0,250,0,0.8)",
                                        highlightFill: "rgba(0,250,0,0.75)",
                                        highlightStroke: "rgba(0,220,0,1)",
                                        data: arrayAciertos
                                    },
                                    {
                                        fillColor: "rgba(220,0,0,0.6)",
                                        strokeColor: "rgba(250,0,0,0.8)",
                                        highlightFill: "rgba(250,0,0,0.75)",
                                        highlightStroke: "rgba(250,0,0,1)",
                                        data: arrayFallos
                                    }
                                ]

                            };



//

                            try {
                                //para que la primera vez de ejecucion no salte error
                                statistics.mipie.destroy();
                                statistics.mibar.destroy();
                            } catch (e) {
                            }

                            var ctx2 = document.getElementById("chart-area").getContext("2d");
                            statistics.mipie = new Chart(ctx2).Pie(pieData, {
                                responsive: true
                            });


                            var ctx = document.getElementById("canvas").getContext("2d");
                            statistics.mibar = new Chart(ctx).Bar(barChartData, {
                                responsive: true
                            });


                        });
            } catch (e) {
                $('#bylevel').text('Statistics are empty!.');
                $('#percent').hide();
            }



        }
    };
};