// ==UserScript==
// @name         Demigrant Script
// @namespace    https://github.com/cerdosaurio/
// @version      0.1.3
// @description  Sucedáneo demigrante de shurscript
// @author       cerdosaurio
// @include      http://www.forocoches.com*
// @include      http://forocoches.com*
// @grant        GM_getValue
// @grant        GM_setValue
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var pagina = 1;
var botonNuevosPosts = null;
var numNuevosPosts = 0;
var idUsuario = 0;
var nombreUsuario = null;
var urlBusqueda = null;
var numNuevasCitas = 0;

function despliegaNuevosPosts() {
    $(".postInvisible").show();
    botonNuevosPosts.remove();
    botonNuevosPosts = null;
	numNuevosPosts = 0;
    if(document.title.charAt(0) == "*")
        document.title = document.title.substr(2);
}

function buscaNuevosPosts() {
    $.get(document.URL, function(data) {
        var html = $.parseHTML(data);
        var nuevos = [];
        $("table[class^=tborder][id^=post]", html).each(function() {
            if(!$("table#" + $(this).attr("id")).length) {
                numNuevosPosts++;
            	nuevos.push($(this).parent().parent().parent().addClass("postInvisible").hide());
            }
        });
        if(numNuevosPosts) {
            if(document.title.charAt(0) != "*")
	            document.title = "* " + document.title;
            var mensajeNuevos = "Hay " + numNuevosPosts + (numNuevosPosts == 1 ? " post nuevo" : " posts nuevos");
            if(!botonNuevosPosts) {
                botonNuevosPosts = $("<div class=\"botonNuevosPosts\"></div>");
	            $("div#posts #lastpost").before(botonNuevosPosts);
                botonNuevosPosts.click(despliegaNuevosPosts);
            }
            botonNuevosPosts.text(mensajeNuevos);
            $("div#posts #lastpost").before(nuevos);
        }
        var paginadorSiguiente = $(".pagenav a[href$='&page=" + (pagina + 1) + "']", html);
        if(paginadorSiguiente.length) {
            if(document.title.charAt(0) != "*")
	            document.title = "* " + document.title;
            botonNuevaPagina = $("<div class=\"botonNuevosPosts\"></div>").text("Hay una nueva página");
            if(botonNuevosPosts)
	            botonNuevaPagina.addClass("postInvisible").hide();
            botonNuevaPagina.click(function() {
                window.location.href = paginadorSiguiente.attr("href");//url + "?t=" + hilo + "&page=" + (pagina + 1);
            });
            $("div#posts #lastpost").before(botonNuevaPagina);
        }
        else
	    	setTimeout(buscaNuevosPosts, 30000);
    });
}

var meses = {
    "ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6,
    "jul": 7, "ago": 8, "sep": 9, "oct": 10, "nov": 11, "dic": 12
};

function analizaFecha(fecha) {
    var dia, mes, anho, hora, minuto;
    if(fecha === undefined)
        fecha = "Ahora";
    else {
    	var aFechaHora = fecha.split(", ");
    	if(aFechaHora.length != 2)
            return null;
        hora = aFechaHora[1].substr(0, 2);
        minuto = aFechaHora[1].substr(3, 2);
        fecha = aFechaHora[0];
    }
    switch(fecha) {
        case "Ahora":
            var d = new Date();
            dia = d.getDate();
            mes = d.getMonth() + 1;
            anho = d.getFullYear();
            hora = d.getHours();
            hora = (hora < 10 ? "0" : "") + hora;
            minuto = d.getMinutes();
            minuto = (minuto < 10 ? "0" : "") + minuto;
            break;
        case "Hoy":
            var d = new Date();
            dia = d.getDate();
            mes = d.getMonth() + 1;
            anho = d.getFullYear();
            break;
        case "Ayer":
            var d = new Date();
            d.setTime(d.getTime() - 24*3600*1000);
            dia = d.getDate();
            mes = d.getMonth() + 1;
            anho = d.getFullYear();
            break;
        default:
            var aFecha = aFechaHora[0].split("-");
            if(aFecha.length != 3)
                return null;
            dia = Number(aFecha[0]);
            mes = meses[aFecha[1]];
            anho = Number(aFecha[2]);
            break;
    }
    return anho + (mes < 10 ? "0" : "") + mes + (dia < 10 ? "0" : "") + dia + hora + minuto;
}

function leeTMinNuevasCitas() {
    if(!idUsuario)
        return null;
	var tMinNuevasCitas = GM_getValue("Demigrant" + idUsuario + "_ct", "");
    if(tMinNuevasCitas === "") {
        tMinNuevasCitas = analizaFecha();
        GM_setValue("Demigrant" + idUsuario + "_ct", tMinNuevasCitas);
    }
    return tMinNuevasCitas;
}

function escribeTMinNuevasCitas(tMinNuevasCitas) {
    if(idUsuario)
        GM_setValue("Demigrant" + idUsuario + "_ct", tMinNuevasCitas);
}

function deserializaCitasLeidas() {
    var citasLeidas = {};
    if(idUsuario) {
        var tMinNuevasCitas = leeTMinNuevasCitas();
    	var aCitas = GM_getValue("Demigrant" + idUsuario + "_cl", "").split(",");
        for(var i = 0; i < aCitas.length; i++) {
            var aPostFecha = aCitas[i].split("_");
            if(aPostFecha.length == 2 && aPostFecha[1] >= tMinNuevasCitas)
                citasLeidas[aPostFecha[0]] = aPostFecha[1];
        }
    }
    return citasLeidas;
}

function serializaCitasLeidas(citasLeidas) {
    if(idUsuario) {
        var tMinNuevasCitas = leeTMinNuevasCitas();
        var valor = "";
        for(var idPost in citasLeidas)
            if(citasLeidas[idPost] >= tMinNuevasCitas)
            	valor += "," + idPost + "_" + citasLeidas[idPost];
    	GM_setValue("Demigrant" + idUsuario + "_cl", valor.substr(1));
    }
}

/*
function citaLeida(idPost) {
    var citasLeidas = GM_getValue("DemigrantScript_citasLeidas", "");
    var patron = new RegExp("\\b" + idPost + "\\b,|,\\b" + idPost + "\\b$", "g");
    return citasLeidas.replace(patron, "");
}
*/
function cierraCitas() {
    $('#sombra').hide();
    $('#modal').hide();
    return false;
}

function actualizaContadorCitas() {
    $("#abreCitas #numCitas").html(numNuevasCitas);
    $("#abreCitas .smallfont").html(numNuevasCitas == 1 ? "nueva cita" : "nuevas citas");
    $("#abreCitas").removeClass("siNuevas noNuevas").addClass(numNuevasCitas ? "siNuevas" : "noNuevas");
}

function citaLeida(idPost, timestamp) {
    var citasLeidas = deserializaCitasLeidas();
    citasLeidas[idPost] = timestamp;
    serializaCitasLeidas(citasLeidas);
    numNuevasCitas--;
    var idPostFecha = idPost + "_" + timestamp;
    var divCita = $("#listaCitas" + idPostFecha);
    divCita.removeClass("noLeido").addClass("leido");
    $("#leeCita" + idPostFecha, divCita).removeAttr("id");
    $("#citaLeida" + idPostFecha, divCita).parent().remove();
    divCita.remove();
    var insertado = false;
    $("#listaCitas > .leido").each(function() {
        var aId = $(this).attr("id").substr(10).split("_");
        if(aId[1] < timestamp) {
            divCita.insertBefore($(this));
            insertado = true;
            return false;
        }
        return true;
    });
    if(!insertado)
        $("#listaCitas").append(divCita);
    actualizaContadorCitas();
    return true;
}

function buscaCitas() {
   	tCitasLeidas = GM_getValue("Demigrant" + idUsuario + "_ct", "");
    $.get(urlBusqueda, function(data) {
        var html = $.parseHTML(data);
        var htmlNoLeidos = "";
        var htmlLeidos = "";
    	var citasLeidas = deserializaCitasLeidas();
        var tMinNuevasCitas = leeTMinNuevasCitas();
        var tPrimeraNuevaCita = "";
		$("table[class^=tborder][id^=post]", html).each(function() {
            var idPost = Number($(this).attr("id").substr(4));
            var fechaHora = $.trim($("td:first", this).clone().children().remove().end().text());
            var timestamp = analizaFecha(fechaHora);
            var enlaceHilo = $("td.alt1 a[href^='showthread.php?t=']:first", this);
            var tituloHilo = $("strong", enlaceHilo);
            if(tituloHilo.length != 1)
                tituloHilo = enlaceHilo;
            tituloHilo = tituloHilo.html();
            var idHilo = enlaceHilo.attr("href").match(/^showthread\.php\?t=(\d+)/);
            idHilo = idHilo.length == 2 ? Number(idHilo[1]) : 0;
            var enlaceAutor = $("td.alt1 a[href^='member.php?u=']:first", this);
            var textoPost = $("td.alt1 a[href^='showthread.php?p=" + idPost + "']:first", this).text();
         	var leido = citasLeidas[idPost] !== undefined || timestamp < tMinNuevasCitas;
            if(!leido) {
                numNuevasCitas++;
                tPrimeraNuevaCita = timestamp;
            }
            var idPostFecha = idPost + "_" + timestamp;
            var entrada = "<div id=\"listaCitas" + idPostFecha + "\" class=\"" + (leido ? "leido" : "noLeido") + "\"><table><tr><td class=\"titulo\">" +
                "<a href=\"/foro/showthread.php?t=" + idHilo + "\" target=\"_blank\">" + tituloHilo + "</a><br/>" +
				"<span class=\"smallfont\"><a href=\"/foro/" + enlaceAutor.attr("href") + "\" target=\"_blank\">" + enlaceAutor.html() + "</a>, " + fechaHora + "</span></td></tr>" +
                "<tr><td class=\"cuerpo\">" +
                	"<a " + (leido ? "" : "id=\"leeCita" + idPostFecha + "\" ") + "href=\"/foro/showthread.php?p=" + idPost + "#post" + idPost + "\" target=\"_blank\">" + textoPost + "</a>" +
                "</td></tr></table>" +
                (leido ? "" : "<div class=\"botones\"><a id=\"citaLeida" + idPostFecha + "\" href=\"#\">Marcar como ya leída</a></div>") +
                "</div>";
            if(leido)
                htmlLeidos += entrada;
            else
                htmlNoLeidos += entrada;
        });
        if(tPrimeraNuevaCita !== "" && tPrimeraNuevaCita > tMinNuevasCitas)
            escribeTMinNuevasCitas(tPrimeraNuevaCita);
        $("#listaCitas").html(htmlNoLeidos + htmlLeidos);
        actualizaContadorCitas();
        $("#abreCitas").on("click", function() {
            $("#sombra").show();
            $("#modal").show();
        });
    });
}
/*
var elems = document.getElementsByTagName('table');
for(var i in elems) {
	if((' ' + elems[i].className + ' ').indexOf(" cajasprin ") > -1)
		elems[i].parentNode.removeChild(elems[i]);
}
*/
$(document).ready(function() {

    var head = document.getElementsByTagName("head")[0];
    if(head) {
        var style = document.createElement("style");
        style.type = "text/css";
        style.innerHTML =
            ".botonNuevosPosts { cursor: pointer; color: #fff; font-size: 18px; background-color: #2b2; margin: 16px 0; padding: 8px; text-align: center; }" +
            "#abreCitas { white-space: nowrap; color: #ccc; background-color: #fff; }" +
            "#abreCitas.noNuevas { cursor: pointer; color: #c00; background-color: #fff; }" +
            "#abreCitas.siNuevas { cursor: pointer; color: #fff; background-color: #2b2; }" +
            "#abreCitas #numCitas { font-size: 24px; text-align: center; }" +
            "#sombra { display: none; position: fixed; z-index: 100; top: 0; left: 0; width: 100%; height: 100%; background: #000; opacity: 0.5; filter: alpha(opacity=50); }" +
            "#modal { display: none; position: fixed; z-index: 101; top: 15%; left: 25%; width: 50%; height: 70%; background: #fff; font: 10pt verdana,geneva,lucida,'lucida grande',arial,helvetica,sans-serif; }" +
            "#modal a { font-weight: normal; }" +
            "#modal .smallfont { font-size: 11px; }" +
            "#modal > table { width: 100%; height: 100%; border-spacing: 0; }" +
            "#modal > table th { font-size: 18px; font-weight:normal; line-height:18px; height: 28px; color: #fff; background-color: #ccc; border-bottom: solid 4px #fff; }" +
            "#modal > table th a { color: #fff; }" +
            "#modal > table th:first-child { width: 16px; }" +
            "#modal > table th.barraTitulo { text-align: left; }" +
            "#modal > table th:last-child { width: 16px; }" +
            "#listaCitas { width: 100%; height: 100%; overflow-y: auto; }" +
            "#listaCitas > div { margin-right: 16px; border-bottom: solid 1px #ddd; padding-bottom: 8px }" +
            "#listaCitas > div:last-child { border-bottom: none; padding-bottom: 4px }" +
            "#listaCitas table { width:100%;border-collapse: collapse; }" +
            "#listaCitas td { border: solid 1px #fff; padding: 6px 8px }" +
            "#listaCitas td.titulo { padding-bottom: 2px; }" +
            "#listaCitas td.titulo a { font-weight: bold; }" +
            "#listaCitas td.titulo span.smallfont a { font-weight: normal; }" +
            "#listaCitas td.cuerpo { font-style: italic; }" +
            "#listaCitas div.leido td.cuerpo { font-size: 11px; }" +
            "#listaCitas div.noLeido td.cuerpo { background: #2b2; }" +
            "#listaCitas div.noLeido td.cuerpo a { color: #fff; }" +
            "#listaCitas div.botones { margin-top: 4px; font-size: 11px; }";
        head.appendChild(style);
    }

    var aRutaURL = document.URL.match(/^.*:\/\/([a-z\-.]+)(?::[0-9]+)?([^\?#]*).*$/);
    var dominioURL = aRutaURL[1];
    var rutaURL = aRutaURL[2] == "" ? "/" : aRutaURL[2];
    if(rutaURL == "/foro/showthread.php") {
        var paginadorActual = $(".pagenav td.alt2 > span.mfont > strong").first();
        if(paginadorActual.length)
            pagina = Number(paginadorActual.text());
        if(!$(".pagenav a[href$='&page=" + (pagina + 1) + "']").length)
		    setTimeout(buscaNuevosPosts, 30000);
    }

    switch(rutaURL) {
        case "/":
            var filaNombre = $("table.cajascat tr").first();
            if(filaNombre.length) {
                var tdNombre = $("td", filaNombre).first();
                if(tdNombre.length) {
                    var textoUsuario = tdNombre.html();
                    if(textoUsuario.substr(0, 8) == "&nbsp;+ ") {
                        nombreUsuario = textoUsuario.substr(8);
                        var enlace = $("td a", filaNombre);
                        if(enlace.length) {
                            var aEnlace = enlace.attr("href").match(/userid=(\d+)/);
                            if(aEnlace.length == 2) {
                                idUsuario = Number(aEnlace[1]);
                                $("table.cajascat td[colspan=2] table tr").first().append("<td id=\"abreCitas\" rowspan=\"3\"></td>");
                            }
                        }
                    }
                }
            }
            break;
        default:
            $("div.page table tr:first-child").each(function() {
                var saludo = $("> td.alt2[nowrap=nowrap] div.smallfont strong", this).first();
                if(saludo.length && saludo.html().substr(0, 5) == "Hola,") {
                    var enlaceUsuario = $("a:first", saludo);
                    var hrefUsuario = enlaceUsuario.attr("href");
                    if(hrefUsuario.substr(0, 13) == "member.php?u=") {
                        idUsuario = Number(hrefUsuario.substr(13));
                        nombreUsuario = enlaceUsuario.text();
                        $(this).append("<td id=\"abreCitas\"></td>");
                        return false;
                    }
                }
                return true;
            });
            break;
	}

    if(idUsuario && nombreUsuario) {
        urlBusqueda = "http://www.forocoches.com/foro/search.php?do=process&query=" + nombreUsuario + "&titleonly=0&showposts=1";
        $("#abreCitas").html("<div id=\"numCitas\">...</div><div class=\"smallfont\">nuevas citas</div>");
        $("body").append("<div id=\"sombra\"></div>");
        $("body").append("<div id=\"modal\">" +
                         "<table>" +
                         "<tr><th></th><th class=\"barraTitulo\">Citas de " + nombreUsuario + "</th><th>" +
                         "<a id=\"cierraCitas\" href=\"#\" title=\"Cerrar\">X</a>" +
                         "</th></tr>" +
                         "<tr><td></td><td><div id=\"listaCitas\"></div></td><td></td></tr>" +
                         "<tr><td colspan=\"3\" style=\"height:14px\"></td></tr>" +
                         "</table></div>"
                        );
        $("#sombra").on("click", cierraCitas);
        $("#cierraCitas").on("click", cierraCitas);
        $("#listaCitas").on("click", "a[id^=leeCita]", function() {
            var aPostFecha = $(this).attr("id").substr(7).split("_");
            citaLeida(aPostFecha[0], aPostFecha[1]);
            return true;
        });
        $("#listaCitas").on("click", "a[id^=citaLeida]", function() {
            var aPostFecha = $(this).attr("id").substr(9).split("_");
            citaLeida(aPostFecha[0], aPostFecha[1]);
            return false;
        });
        deserializaCitasLeidas();
        buscaCitas();
    }

});
