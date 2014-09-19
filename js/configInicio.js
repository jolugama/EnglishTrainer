var configInicio = false;

//si no hay datos locales guardados, se carga scripts src.  workaround para minimizar datos de carga
if (localStorage.getItem("etVocabularioIngles") === null || localStorage.getItem("etFrasesIngles") === null) {
    var sc = document.createElement('script');
    sc.src = 'jsonFiles/game_vocabulario_ingles.js';
    document.getElementsByTagName('head')[0].appendChild(sc);
    var sc2 = document.createElement('script');
    sc2.src = 'jsonFiles/game_frase_ingles.js';
    document.getElementsByTagName('head')[0].appendChild(sc2);
    configInicio = true;
}