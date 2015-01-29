// ==UserScript==
// @name         Demigrant Script
// @namespace    https://github.com/cerdosaurio/
// @version      0.2.2
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

function buscaCitasMenciones(html, tipo) {
    return Number($("td.alt2 > a[href$='tab=" + tipo + "'] > div > span", html).first().text());
}

function actualizaCitasMenciones(numero, tipo) {
	var enlace = $("td.alt2 > a[href$='tab=" + tipo + "']").first();
    enlace.parent().css("background-color", numero ? "#ffffcc" : "#f1f1f1");
    $("span", enlace).first().text(numero);
}

function buscaNuevosPosts() {
    $.get(document.URL, function(data) {
        var html = $.parseHTML(data, document, true);

        actualizaCitasMenciones(buscaCitasMenciones(html, "mentions"), "mentions");
        actualizaCitasMenciones(buscaCitasMenciones(html, "quotes"), "quotes");

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

function cierraModal() {
    $('#sombraModal').hide();
    $('.ventanaModal').hide();
    return false;
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

// fondo de citas: #ffffcc;

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
            "#ventanaAviso #mensaje { text-align: center; }";
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
//                                $("table.cajascat td[colspan=2] table tr").first().append("<td id=\"abreCitas\" rowspan=\"3\"></td>");
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
//                        $(this).append("<td id=\"abreCitas\"></td>");
                        return false;
                    }
                }
                return true;
            });
            break;
	}

	$("body").append("<div id=\"sombraModal\"></div>");
    anhadeVentanaModal("ventanaAviso", "Aviso", "mensaje");
    $("#sombraModal").on("click", cierraModal);
    $(".cierraModal").on("click", cierraModal);

    cargaVideos();
});
