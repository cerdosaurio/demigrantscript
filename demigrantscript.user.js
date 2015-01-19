// ==UserScript==
// @name         Demigrant Script
// @namespace    https://github.com/cerdosaurio/
// @version      0.2.1
// @description  Alternativa al Shurscript
// @author       cerdosaurio
// @include      http://www.forocoches.com*
// @include      http://forocoches.com*
// @grant        GM_getValue
// @grant        GM_setValue
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var pagina = 1;
var ultimaPagina = true;
var htmlPrimeraPagina = "";
var botonNuevosPosts = null;
var numNuevosPosts = 0;
var idUsuario = 0;
var nombreUsuario = null;
var urlBusqueda = null;
var numNuevasCitas = 0;
var postsOriginales = {};
var postsEditados = {};

function despliegaNuevosPosts() {
    $(".postInvisible").show();
    botonNuevosPosts.remove();
    botonNuevosPosts = null;
	numNuevosPosts = 0;
    if(document.title.charAt(0) == "*")
        document.title = document.title.substr(2);
}

function eliminaNuevosPosts() {
    $(".postInvisible").remove();
    botonNuevosPosts.remove();
    botonNuevosPosts = null;
	numNuevosPosts = 0;
    if(document.title.charAt(0) == "*")
        document.title = document.title.substr(2);
    $("div#posts").remove("#botonNuevaPagina");
    return true;
}

function muestraAviso() {
    $("#sombraModal").show();
    $("#ventanaAviso").show();
    $("#ventanaAviso").css("margin-top", -0.5*$("#ventanaAviso").outerHeight() + "px");
}

function avisoTemaEliminado() {
    var htmlAviso = "<h2><img src=\"http://i.imgur.com/u3rtmQA.png\" width=\"100\" height=\"100\" alt=\"Flanders\" /> Este tema ha sido eliminado</h2>No recargues la página si quieres seguir leyendo los mensajes.";
    var clasesCuadro = "cuadroHiloEliminado";
    var htmlCuadro = "<strong>Tema eliminado</strong>";
    if(htmlPrimeraPagina !== "") {
        htmlAviso += "<br/><br/><strong>Se ha guardado una copia de la primera página del hilo</strong>; puedes verla <a class=\"verPrimeraPagina\" href=\"#\">aquí</a>.";
        clasesCuadro += " verPrimeraPagina";
        htmlCuadro += " - pulsa aquí para ver una copia guardada de la primera página del hilo.";
    }
	$("<div class=\"" + clasesCuadro + "\">" + htmlCuadro + "</div>").insertAfter("a#poststop, div#posts");
    $("#ventanaAviso #mensaje").html(htmlAviso);
    muestraAviso();
    $(".verPrimeraPagina").on("click", function() {
        var nuevaVentana = window.open();
        nuevaVentana.document.write(htmlPrimeraPagina);
        nuevaVentana.document.close();
        return false;
    });
}

function detectaTemaEliminado(html) {
    var avisoEliminado = $("td.panelsurround > div.panel > div[align=left] > div > center", html === undefined ? document : html).first();
	return avisoEliminado.length && $.trim(avisoEliminado.text()) == "Tema especificado inválido.";
}

function muestraPostOriginal(idPost) {
    $("#td_post_" + idPost).html(postsOriginales[idPost]);
    $("#verOriginal" + idPost).hide();
    $("#verEditado" + idPost).show();
}

function muestraPostEditado(idPost) {
    $("#td_post_" + idPost).html(postsEditados[idPost]);
    $("#verOriginal" + idPost).show();
    $("#verEditado" + idPost).hide();
}

function buscaNuevosPosts() {
    $.get(document.URL, function(data) {
        var html = $.parseHTML(data, document, true);

        if(detectaTemaEliminado(html)) {
            $("div#posts").remove("#botonNuevaPagina");
            avisoTemaEliminado();
            return;
        }
/*
        $("table[class^=tborder][id^=post]", html).each(function() {
            var idPost = $(this).attr("id").substr(4);
			var htmlNuevo = $("#td_post_" + idPost, this).html();
            if(postsOriginales[idPost] === undefined)
                postsOriginales[idPost] = htmlNuevo;
            else {
                if(postsOriginales[idPost] != htmlNuevo) {//var i;for(i=0;i<htmlNuevo.length;i++)if(postsOriginales[idPost].charAt(i) != htmlNuevo.charAt(i)){alert(postsOriginales[idPost].substr(i) +" "+htmlNuevo.substr(i));break;}
                    var piePost = $("td", $("#post" + idPost + " > tbody > tr").last()).last();
                    if(!$(".cabeceraPostEditado", piePost).length) {
                        piePost.prepend($("<div class=\"cabeceraPostEditado\" id=\"verOriginal" + idPost + "\"><strong>Post editado</strong> - ver original</div>"));
                        piePost.prepend($("<div class=\"cabeceraPostEditado\" id=\"verEditado" + idPost + "\"><strong>Post editado</strong> - ver editado</div>"));
                    }
                    if(postsEditados[idPost] === undefined || postsEditados[idPost] !== htmlNuevo) {
                        postsEditados[idPost] = htmlNuevo;
                        muestraPostEditado(idPost);
                    }
                }
            }
		});
*/
        if(ultimaPagina) {
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
                var botonNuevaPagina = $("<div id=\"botonNuevaPagina\" class=\"botonNuevosPosts\"></div>").text("Hay una nueva página");
                if(botonNuevosPosts)
                    botonNuevaPagina.addClass("postInvisible").hide();
                botonNuevaPagina.click(function() {
                    window.location.href = paginadorSiguiente.attr("href");//url + "?t=" + hilo + "&page=" + (pagina + 1);
                });
                $("div#posts #lastpost").before(botonNuevaPagina);
                ultimaPagina = false;
            }
        }

		setTimeout(buscaNuevosPosts, 30000);
    }).fail(function() {
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
function cierraModal() {
    $('#sombraModal').hide();
    $('.ventanaModal').hide();
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
            $("#sombraModal").show();
            $("#ventanaCitas").show();
        });
    });
}

/*
var elems = document.querySelectorAll("table.cajasprin");
for(var i = 0; i < elems.length; i++)
    if(!elems[i].querySelector("#AutoNumber7") && !elems[i].querySelector("#AutoNumber9"))
	    elems[i].style.border = "solid 2px #f00";
//		elems[i].parentNode.removeChild(elems[i]);
elems = document.querySelectorAll("table.cajanews > tr");
*/

function anhadeVentanaModal(idVentana, titulo, idCuerpo, botones) {
    var htmlBotones = "";
    if(botones === undefined)
        botones = [ { class: "cierraModal", text: "Aceptar" } ];
	for(var i = 0; i < botones.length; i++)
        htmlBotones += "<div class=\"botonModal" + (botones[i]["class"] === undefined ? "" : " " + botones[i]["class"]) + "\"" + (botones[i]["id"] === undefined ? "" : " id=\"" + botones[i]["id"]) + "\"" + ">" + botones[i]["text"] + "</div>";
	$("body").append("<div id=\"" + idVentana + "\" class=\"ventanaModal\">" +
                     "<table><tbody>" +
                     "<tr><th></th><th class=\"barraTitulo\">" + titulo + "</th><th>" +
                     "<a class=\"cierraModal\" href=\"#\" title=\"Cerrar\">X</a>" +
                     "</th></tr>" +
                     "<tr><td class=\"espaciado\" colspan=\"3\"></td></tr>" +
                     "<tr><td></td><td><div id=\"" + idCuerpo + "\"></div></td><td></td></tr>" +
                     "<tr><td class=\"espaciado\" colspan=\"3\"></td></tr>" +
                     "<tr><td colspan=\"3\"><div style=\"float: right\">" + htmlBotones + "</div></td></tr>" +
                     "</tbody></table></div>"
                    );
}

function cargaVideos() {

	// Carga videos a partir de url's .webm
    $('a[href$=".webm"]').each(function() {
        var link = $(this).attr('href');
       
        var video = document.createElement('video');
        video.src = link;
        video.autoplay = false;
        video.loop = true;
        video.muted = true;
        video.controls = true;
        video.style.maxWidth = "600px";
        video.style.maxHeight = "600px";
        video.addEventListener('mouseover', function(event) {
            this.play();
                img.style.visibility = "hidden";
        });
        video.addEventListener('click' , function(event) {
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }
        });
               
        var img = document.createElement('img');
                img.src="http://www.webmproject.org/media/images/webm-558x156.png";
        img.style.position = "relative";
                img.style.maxWidth = "200px";
                //img.style.maxHeight = "50px";
        img.style.top = "-10px";
        img.style.left = "-210px";
        img.style.opacity = "0.5";
       
        $(this).after(img);
        $(this).after(video);
        $(this).remove();
       
    });
   
    // Carga videos de gfycat.com via api gfycat http://gfycat.com/api
    $('a[href*="gfycat.com"]').each(function() {
        var dataID = $(this).attr('href').replace(/.*?:\/\/([w]+)?\.?gfycat\.com\//g, "");
        var $this = $(this);
        $.ajax({
          type: "GET",
          url: "http://gfycat.com/cajax/get/"+dataID,
          async: true,
          dataType: "json",
          success: function(data){
            var video = document.createElement('video');
            video.src = data.gfyItem.mp4Url;
            video.src = data.gfyItem.webmUrl;
            video.autoplay = false;
            video.loop = true;
            video.muted = true;
            video.controls = true;
            video.style.maxWidth = "600px";
            video.style.maxHeight = "600px";
            $this.append('<br>');
            $this.after(video);
          }
        });
    });
     
    // Carga videos de mediacru.sh
    $('a[href*="mediacru.sh"]').each(function() {    
       var url = $(this).attr('href').replace(/.*?:\/\//g, "");
       var video = document.createElement('video');
       video.src = '//cdn.'+url+'.mp4';
       video.src = '//cdn.'+url+'.webm';
       video.autoplay = false;
       video.loop = true;
       video.muted = true;
       video.controls = true;
       video.style.maxWidth = "600px";
       video.style.maxHeight = "600px";
       $(this).append('<br>');
       $(this).after(video);
    });
}

$(document).ready(function() {

    var head = document.getElementsByTagName("head")[0];
    if(head) {
        var style = document.createElement("style");
        style.type = "text/css";
        style.innerHTML =
            ".botonNuevosPosts { cursor: pointer; color: #fff; font-size: 18px; background-color: #2a2; margin: 16px 0; padding: 8px; text-align: center; }" +
            ".cabeceraPostEditado { cursor: pointer; font-size: 13px; color: #fff; background-color: #2a2; margin: 8px 0; padding: 8px; text-align: center; }" +
            ".postBorrado { position: relative; }" +
            ".postBorrado:after { content: \" \"; z-index: 10; display: block; position: absolute; height: 100%; top: 0; left: 0; right: 0; background: rgba(255, 255, 255, 0.5); pointer-events: none; }" +
            ".cuadroHiloEliminado { color: #fff; font-size: 18px; background-color: #d20; margin: 16px 0; padding: 8px; text-align: center; }" +
            ".verPrimeraPagina { cursor: pointer; }" +
            "#abreCitas { white-space: nowrap; color: #ccc; background-color: #fff; }" +
            "#abreCitas.noNuevas { cursor: pointer; color: #c00; background-color: #fff; }" +
            "#abreCitas.siNuevas { cursor: pointer; color: #fff; background-color: #2a2; }" +
            "#abreCitas #numCitas { font-size: 24px; text-align: center; }" +
            "#sombraModal { display: none; position: fixed; z-index: 100; top: 0; left: 0; width: 100%; height: 100%; background: #000; opacity: 0.5; filter: alpha(opacity=50); }" +
            ".ventanaModal { display: none; position: fixed; background: #fff; border: solid 1px #ccc; border-radius: 4px; font: 10pt verdana,geneva,lucida,'lucida grande',arial,helvetica,sans-serif; }" +
            ".ventanaModal a { font-weight: normal; }" +
            ".ventanaModal .smallfont { font-size: 11px; }" +
            ".ventanaModal > table { width: 100%; height: 100%; border-spacing: 0; }" +
            ".ventanaModal > table th { font-size: 18px; font-weight:normal; line-height:18px; height: 28px; color: #fff; background-color: #ccc; }" +
            ".ventanaModal > table th a { color: #fff; }" +
            ".ventanaModal > table th:first-child { width: 16px; }" +
            ".ventanaModal > table th.barraTitulo { text-align: left; }" +
            ".ventanaModal > table th:last-child { width: 16px; }" +
            ".ventanaModal > table td.espaciado { height: 12px; }" +
            ".ventanaModal > table > tbody > tr:last-child > td { height: 32px; padding: 12px 16px 20px 16px; border-top: solid 1px #ccc; }" +
            ".ventanaModal .botonModal { display: inline-block; cursor: pointer; width: 98px; height: 14px; border: solid 1px #ccc; border-radius: 4px; margin-left: 8px; padding: 8px 0; font-size: 14px; line-height: 14px; text-align: center; background-color: #eee; color: #333; }" +
            ".ventanaModal .botonModal:hover { background-color: #ccc; color: #fff; }" +
            "#ventanaCitas { z-index: 101; top: 15%; left: 25%; width: 50%; height: 70%; }" +
            "#ventanaAviso { z-index: 102; left: 50%; top: 50%; margin-left: -300px; width: 600px; }" +
            "#ventanaAviso #mensaje { text-align: center; }" +
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
            "#listaCitas div.noLeido td.cuerpo { background: #2a2; }" +
            "#listaCitas div.noLeido td.cuerpo a { color: #fff; }" +
            "#listaCitas div.botones { margin-top: 4px; font-size: 11px; }";
        head.appendChild(style);
    }

    var aRutaURL = document.URL.match(/^.*:\/\/([a-z\-.]+)(?::[0-9]+)?([^\?#]*).*$/);
    var dominioURL = aRutaURL[1];
    var rutaURL = aRutaURL[2] == "" ? "/" : aRutaURL[2];
    if(rutaURL == "/foro/showthread.php" && !detectaTemaEliminado()) {
        var paginadorActual = $(".pagenav td.alt2 > span.mfont > strong").first();
        if(paginadorActual.length)
            pagina = Number(paginadorActual.text());
        ultimaPagina = !$(".pagenav a[href$='&page=" + (pagina + 1) + "']").length;
//        if(!$(".pagenav a[href$='&page=" + (pagina + 1) + "']").length) {
/*            $("#posts td[id^=td_post_]").each(function() {
                var post = $(this).clone().remove("div.video-youtube");
                postsOriginales[$(this).attr("id").substr(8)] = post.html().
                	replace(/ title=\"Ver Mensaje\"/g, "").
                	replace(/ title=\"Pulsar imagen para la versión ampliada[^\"]*\"/g, "").
                	replace(/ sl-processed=\"1\"/g, "").
					replace(/ style=\"display: none !important;\"/g, ""). // bloqueado por Adblock
                	replace(/<div align=\"center\" class=\"video-youtube\"><div class=\"video-container\"><iframe title=\"YouTube video player\" class=\"youtube-player\" type=\"text\/html\" width=\"\d+\" height=\"\d+\" src=\"[^\"]+\" frameborder=\"0\" allowfullscreen=\"\"><\/iframe><\/div><\/div>/g, "");
            });*/
		    setTimeout(buscaNuevosPosts, 30000);
            $("#qr_submit").on("click", eliminaNuevosPosts);
/*            $("#posts").on("click", "div[id^=verOriginal]", function() {
                muestraPostOriginal($(this).attr("id").substr(11));
            });
            $("#posts").on("click", "div[id^=verEditado]", function() {
                muestraPostEditado($(this).attr("id").substr(10));
            });*/
//        }
        if(pagina > 1) {
            var paginadorPrimera = $(".pagenav td.alt1 > a.mfont").first();
            if(paginadorPrimera.length) {
                var aPaginadorPrimera = paginadorPrimera.attr("href").match(/^showthread\.php\?t=(\d+)/);
                if(aPaginadorPrimera.length > 1) {
                    $.get("/foro/showthread.php?t=" + aPaginadorPrimera[1], function(data) {
                        htmlPrimeraPagina = data;
                    });
                }
            }
        }
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

	$("body").append("<div id=\"sombraModal\"></div>");
    anhadeVentanaModal("ventanaAviso", "Aviso", "mensaje");
    if(idUsuario && nombreUsuario) {
        urlBusqueda = "http://www.forocoches.com/foro/search.php?do=process&query=" + nombreUsuario + "&titleonly=0&showposts=1";
        $("#abreCitas").html("<div id=\"numCitas\">...</div><div class=\"smallfont\">nuevas citas</div>");
        anhadeVentanaModal("ventanaCitas", "Citas de " + nombreUsuario, "listaCitas");
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
    $("#sombraModal").on("click", cierraModal);
    $(".cierraModal").on("click", cierraModal);

    cargaVideos();
});
