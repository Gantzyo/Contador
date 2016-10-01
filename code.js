$(function () {

    /*
     * Mapeo de variables en las URL
     * i = inicio
     * f = fin
     * c = cantidad
     * n = intervalo
     * t = titulo
     * d = descripcion
     * r = redireccion
     * tm = tiempo hasta redireccion
     */

    // Inicialización que no requiere carga de datos
    var timer;
    var baseURL = document.location.protocol + '//' + window.location.hostname + window.location.pathname;
    var recibidos = false;

    // Funciones

    /**
     * 
     * @param {float} current
     * @param {float} end
     * @param {float} amount
     * @param {integer} interval
     * @param {Boolean} incremental
     * @returns {undefined} void
     */
    function play(current, end, amount, interval, incremental) {
        if ((incremental && current < end) || (!incremental && current > end)) {
            if (incremental) {
                current += amount;
                if (current > end)
                    current = end;
            } else {
                current -= amount;
                if (current < end)
                    current = end;
            }

            $("#contador").html(parseFloat(current.toFixed(2)));
            clearTimeout(timer);
            timer = setTimeout(function () {
                play(current, end, amount, interval, incremental)
            }, interval);
        } else {
            $("#contador").html(end);
            clearTimeout(timer);
            if (recibidos) {
                if (end == 9000.1) {
                    $("#contador").addClass("largeHeader");
                    $("#contador").html("IT'S OVER 9000!!!");
                    ion.sound({
                        sounds: [
                            {name: "over-9000"}
                        ],
                        // main config
                        path: "",
                        preload: true,
                        multiplay: true,
                        volume: 1
                    });

                    // play sound
                    ion.sound.play("over-9000");
                } else if ($("#redireccion").val() && $("#redireccion").val().trim().length > 0) {
                    setTimeout(function () {
                        window.location.href = $("#redireccion").val();
                    }, $("#tiempo").val());
                }
            }
        }
    }

    /**
     * Comprueba si los campos son válidos
     * @param {Boolean} sendMessage Si sendMessage=true se manda un mensaje al usuario avisando de los errores
     * @returns {Boolean} True si todos los campos son validos
     */
    function checkValidData(sendMessage) {
        var validData = true;
        var inicio = $("#inicio").val();
        var fin = $("#fin").val();
        var cantidad = $("#cantidad").val();
        var intervalo = $("#intervalo").val();
        var tiempo = $("#tiempo").val();
        if (!$.isNumeric(inicio)) {
            validData = false;
            if (sendMessage)
                alert("El valor inicial es inválido.");
        } else if (!$.isNumeric(fin)) {
            validData = false;
            if (sendMessage)
                alert("El valor final es inválido.");
        } else if (!$.isNumeric(cantidad) || cantidad <= 0) {
            validData = false;
            if (sendMessage)
                alert("El valor 'cantidad' es inválido.");
            // 'intervalo' debe ser un integer
        } else if (!($.isNumeric(intervalo) && Math.floor(intervalo) == +intervalo)) {
            validData = false;
            if (sendMessage)
                alert("El valor 'intervalo' es inválido.");
            // tiempo debe ser un integer o null
        } else if (tiempo && !($.isNumeric(tiempo) && Math.floor(tiempo) == +tiempo)) {
            validData = false;
            if (sendMessage)
                alert("El valor 'tiempo' es inválido.");
        }
        return validData;
    }

    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = window.location.search.substring(1),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
        return false;
    };

    function encodeUrlParameter(parameter, value) {
        return parameter + "=" + encodeURIComponent(btoa(value));
    }

    function setUrlValue(element, searchedValue, defaultValue) {
        var value = getUrlParameter(searchedValue);
        if (value && value.trim().length > 0) {
            element.val(atob(decodeURIComponent(value)));
            recibidos = true;
        } else {
            var value = defaultValue || "";
            element.val(value);
        }
    }

    // Eventos
    $("#test").click(function () {
        if (checkValidData(true)) {
            clearTimeout(timer);
            var titulo = $("#_titulo").val();
            var descripcion = $("#_descripcion").val();
            var inicio = parseFloat($("#inicio").val());
            var fin = parseFloat($("#fin").val());
            var cantidad = parseFloat($("#cantidad").val());
            var intervalo = parseInt($("#intervalo").val());
            var incremental = fin > inicio;

            $("#titulo").html(titulo);
            $("#descripcion").html(descripcion);
            $("#contador").html(inicio);
            timer = setTimeout(function () {
                play(inicio, fin, cantidad, intervalo, incremental);
            }, intervalo);
        }
    });

    $("#stop").click(function () {
        clearTimeout(timer);
    });

    $(".jqConf").focusout(function () {
        var tiempo = 0;
        if (checkValidData(false)) {
            var inicio = parseFloat($("#inicio").val());
            var fin = parseFloat($("#fin").val());
            var cantidad = parseFloat($("#cantidad").val());
            var intervalo = parseInt($("#intervalo").val());
            var tiempo = parseInt($("#tiempo").val());
            tiempo = isNaN(tiempo) ? 0 : tiempo;

            tiempo = parseFloat((Math.abs(inicio - fin) / cantidad * intervalo / 1000).toFixed(2)) + " + " + parseFloat(tiempo / 1000).toFixed(2);
        }
        $("#aproximado").html(tiempo);
    });

    $(".jqShare").focusout(function () {
        var url = "";
        if (checkValidData(false)) {
            // codificamos en Base64
            var fin = encodeURIComponent(btoa($("#fin").val()));
            var cantidad = encodeURIComponent(btoa($("#cantidad").val()));
            var intervalo = encodeURIComponent(btoa($("#intervalo").val()));
            var titulo = encodeURIComponent(btoa($("#_titulo").val()));
            var desc = encodeURIComponent(btoa($("#_descripcion").val()));

            url = baseURL + "?" + encodeUrlParameter("i", $("#inicio").val());
            url += "&" + encodeUrlParameter("f", $("#fin").val());
            url += "&" + encodeUrlParameter("c", $("#cantidad").val());
            url += "&" + encodeUrlParameter("n", $("#intervalo").val());
            url += "&" + encodeUrlParameter("t", $("#_titulo").val());
            url += "&" + encodeUrlParameter("d", $("#_descripcion").val());
            url += "&" + encodeUrlParameter("r", $("#redireccion").val());
            url += "&" + encodeUrlParameter("tm", $("#tiempo").val());
        }
        $("#compartir").val(url);
    });

    $("#compartirbtn").click(function () {
        $("#compartir").select();
        document.execCommand("copy");
    });


    //////////////
    // Cuando la página ya ha cargado
    //////////////

    // Asignamos los valores de la URL a los campos
    setUrlValue($("#inicio"), "i");
    setUrlValue($("#fin"), "f");
    setUrlValue($("#cantidad"), "c");
    setUrlValue($("#intervalo"), "n");
    setUrlValue($("#_titulo"), "t");
    setUrlValue($("#_descripcion"), "d");
    setUrlValue($("#redireccion"), "r");
    setUrlValue($("#tiempo"), "tm", 3000);

    // Trigger focusout al cargar la pagina para generar el tiempo estimado y la URL para compartir
    $("#inicio").focusout();

    if (recibidos) {
        $("#collapse1").removeClass("in");
        $("#test").click();
    } else {
        $("#cantidad").val(13);
        $("#intervalo").val(10);
    }
});