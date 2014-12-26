// ==UserScript==
// @name         Demigrant Script
// @namespace    https://github.com/cerdosaurio/
// @version      0.1.2
// @description  Sucedáneo demigrante de shurscript
// @author       cerdosaurio
// @include      http://www.forocoches.com/foro/showthread.php*
// @include      http://forocoches.com/foro/showthread.php*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var url = null;
var hilo = null;
var pagina = 1;
var botonNuevosPosts = null;
var numNuevosPosts = 0;

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
                botonNuevosPosts = $("<div></div>").attr("style", "cursor:pointer;color:#fff;font-size:18px;background-color:#2b2;margin:16px 0;padding:8px;text-align:center");
	            $("div#posts #lastpost").before(botonNuevosPosts);
                botonNuevosPosts.click(despliegaNuevosPosts);
            }
            botonNuevosPosts.text(mensajeNuevos);
            $("div#posts #lastpost").before(nuevos);
        }
        if($(".pagenav a[href$='&page=" + (pagina + 1) + "']", html).length) {
            if(document.title.charAt(0) != "*")
	            document.title = "* " + document.title;
            botonNuevaPagina = $("<div></div>").attr("style", "cursor:pointer;color:#fff;font-size:18px;background-color:#2b2;margin:16px 0;padding:8px;text-align:center").
            	text("Hay una nueva página")
            if(botonNuevosPosts)
	            botonNuevaPagina.addClass("postInvisible").hide();
            botonNuevaPagina.click(function() {
                window.location.href = url + "?t=" + hilo + "&page=" + (pagina + 1);
            });
            $("div#posts #lastpost").before(botonNuevaPagina);
        }
        else
	    	setTimeout(buscaNuevosPosts, 10000);
    });
}

$(document).ready(function() {
    var trozosURL = document.URL.split("?", 2);
    if(trozosURL.length == 2) {
        url = trozosURL[0];
        var trozosGET = trozosURL[1].split("&");
        var varsGET = {};
        for(var indice in trozosGET) {
            var varGET = trozosGET[indice].split("=");
            if(varGET.length == 2)
                varsGET[varGET[0]] = varGET[1];
        }
        if(varsGET["t"] !== undefined)
            hilo = varsGET["t"];
        if(varsGET["page"] !== undefined)
            pagina = Number(varsGET["page"]);
        if(!$(".pagenav a[href$='&page=" + (pagina + 1) + "']").length)
		    setTimeout(buscaNuevosPosts, 10000);
    }
});
