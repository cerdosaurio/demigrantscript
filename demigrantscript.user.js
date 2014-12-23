// ==UserScript==
// @name         Demigrant Script
// @namespace    http://your.homepage/
// @version      0.1
// @description  mierdoso y demigrante sucedáneo de shurscript
// @author       cerdosaurio
// @include      http://www.forocoches.com*
// @include      http://forocoches.com*
// @grant        none
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

var url = null;
var hilo = null;
var pagina = 1;
var botonNuevosPosts = null;
var numNuevosPosts = 0;
var hrefOp = null;
var op = null;

function pintaPostsOp() {
    if(hrefOp) {
        $("a.bigusername").each(function() {
            if($(this).attr("href") == hrefOp) {
                $(this).parents("table").first().css("border", "solid 2px #f20").css("border-left-width", "5px");
            }
        });
    }
    if(op) {
        $("td.alt2").each(function() {
            if($(this).attr("style") == "border:1px inset") {
                var div = $(this).children().first();
                if(div.is("div") && $.trim(div.text()) == "Originalmente Escrito por " + op)
                    $(this).css("border", "solid 2px #f20").css("border-left-width", "5px");
            }
        });
    }
}

function procesaPrimeraPagina(html) {
    var enlace = $("a.bigusername", html).first();
    hrefOp = enlace.attr("href");
    op = enlace.text();
    pintaPostsOp();
}

function despliegaNuevosPosts() {
    $(".postInvisible").show();
    botonNuevosPosts.remove();
    botonNuevosPosts = null;
	numNuevosPosts = 0;
    if(document.title.charAt(0) == "*")
        document.title = document.title.substr(2);
    pintaPostsOp();
}

function buscaNuevosPosts() {
    $.get(document.URL, function(data) {
        var html = $.parseHTML(data);
        var nuevos = [];
        $("table.tborder[id^=post]", html).each(function() {
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
                botonNuevosPosts = $("<div></div>").attr("style", "cursor:pointer;color:#fff;font-weight:bold;font-size:18px;background-color:#2b4;margin:16px 0;padding:8px;text-align:center");
	            $("div#posts").append(botonNuevosPosts);
                botonNuevosPosts.click(despliegaNuevosPosts);
            }
            botonNuevosPosts.text(mensajeNuevos);
            $("div#posts").append(nuevos);
        }
        if($(".pagenav a[href$='&page=" + (pagina + 1) + "']", html).length) {
            if(document.title.charAt(0) != "*")
	            document.title = "* " + document.title;
            botonNuevaPagina = $("<div></div>").attr("style", "cursor:pointer;color:#fff;font-weight:bold;font-size:18px;background-color:#2b4;margin:16px 0;padding:8px;text-align:center").
            	text("Hay una nueva página")
            if(botonNuevosPosts)
	            botonNuevaPagina.addClass("postInvisible").hide();
            botonNuevaPagina.click(function() {
                window.location.href = url + "?t=" + hilo + "&page=" + (pagina + 1);
            });
            $("div#posts").append(botonNuevaPagina);
        }
        else
	    	setTimeout(buscaNuevosPosts, 60000);
    });
}

$(document).ready(function() {
    var trozosURL = document.URL.split("?", 2);
    if(trozosURL.length == 2 && (trozosURL[0] == "http://www.forocoches.com/foro/showthread.php" || trozosURL[0] == "http://forocoches.com/foro/showthread.php")) {
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
        if(pagina == 1)
            procesaPrimeraPagina(document);
        else
            $.get("http://www.forocoches.com/foro/showthread.php?t=" + hilo, function(data) {
                procesaPrimeraPagina($.parseHTML(data));
            });
        if(!$(".pagenav a[href$='&page=" + (pagina + 1) + "']").length)
		    setTimeout(buscaNuevosPosts, 60000);
    }
});
