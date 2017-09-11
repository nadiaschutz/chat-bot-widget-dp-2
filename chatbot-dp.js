//wrapping out the code inside the function
$(function () {
    const testing = false;

    /* const url = "https://prodbm-dot-deeppixel-corebot.appspot.com";*/
    const url = "https://stagingaz-dot-deeppixel-corebot.appspot.com";
    //const url = "";
    const serversecret = "XIV97UQ8HCFP718X";
    /*const sessionkey = generateSessionKey();*/
    const sessionkey = "nadia";
    /* const DPID = "9cb6c6b8-1055-4417-b5c7-e19aaae95ff4";*/
    const DPID = "6c5358c4-beb8-4669-9749-5bcfb6c4e894";


    const build = testing ? "dist" : "dist";
    const MAX_SINGLE_REPLY_COUNT = 120;

    const TOP_THRESHOLD = 0.9;
    const BOTTOM_THRESHOLD = 0.6;

    /*  var lastmsg = "";
    var lastcrm = "";*/

    var msg = "";
    var didYouMean, bot_msg, botScore;
    var options = [];

    function callbotCRM() {

        var endpoint = url + '/webapi?dpid=' + DPID + '&channel=' + sessionkey;



        /* var feedback = $.ajax({
             type: "POST",
             url: endpoint,
             async: false,
             dataType: "jsonp",
         }).success(function() {
             setTimeout(function () {
                 callbotCRM();
             }, 10000);
         }).response;

         bot_msg = response.data.response;
         generate_message(bot_msg, 'bot');
         generate_message(bot_msg, 'bot');
         console.log("Bot responded with: ");
         console.log(response);
         console.log(bot_msg);*/


        $.ajax({
            type: "get",
            async: false,
            url: endpoint,
            dataType: "jsonp",
            success: function (response) {
                if (response) {
                    console.log(response);

                    if (response.data.response) {
                        bot_msg = response.data.response;
                        generate_message(bot_msg, 'bot');
                        console.log("Bot responded with: ");
                        console.log(response);
                        console.log(bot_msg);

                    }


                }
            }
        });
    }

    window.setInterval(function () {
        callbotCRM();
    }, 30000);

    function callbot(message) {


        var endpoint = url + '/webapi?dpid=' + DPID + '&phrase=' + encodeURIComponent(message) + '&channel=' + sessionkey + '&threshold=' + TOP_THRESHOLD + '&threshlow=' + BOTTOM_THRESHOLD;
        /*var endpoint = url + '/webapi?dpid=' + DPID + '&channel=' + sessionkey + '&threshold=' + TOP_THRESHOLD + '&threshlow=' + BOTTOM_THRESHOLD + '&phrase=' + encodeURIComponent(message) + 'deeppixel&callback=';*/


        console.log(endpoint);

        /* console.log('url: ' + endpoint);*/

        $.ajax({
            type: "get",
            async: false,
            url: endpoint,
            dataType: "jsonp",
            /*jsonp: "jsonCallback",*/
            //jsonpCallback: "jsonCallback",
            beforeSend: function () {
                $(".spin-container").show();
            },
            complete: function () {
                $(".spin-container").hide();
            },
            success: function (response) {

                console.log("Bot responded with: ");
                console.log(response);
                //Query the jQuery object for the values

                bot_msg = response.data.response;
                bot_score = response.data.score;
                /*botScore = response.data.score;*/
                /*didYouMean = function () {
                    if (botScore < TOP_THRESHOLD && botScore > BOTTOM_THRESHOLD) {
                        var i;
                        var botMatches = response.data.matches;
                        for (i = 0; i < botMatches.length; i++) {
                            console.log(botMatches[i].match);
                        }
                    }
                }();
                
                
*/

                console.log(bot_msg);
                console.log(bot_score);


                /*generate_message(bot_msg, 'bot');*/

                if (bot_score > TOP_THRESHOLD || bot_score < BOTTOM_THRESHOLD) {

                    generate_message(bot_msg, 'bot');
                } else if (bot_score < TOP_THRESHOLD && bot_score > BOTTOM_THRESHOLD) {
                    var botMatches = response.data.matches;

                    if (botMatches || botMatches.length > 0) {

                        /*var i = 0;
                        while (i < matches.length && matches[i].score > BOTTOM_THRESHOLD) {
                            options.push(matches[i++].match);
                            console.log(matches[i].match);
                        }*/
                        var i;
                        var botMatches = response.data.matches;
                        for (i = 0; i < botMatches.length; i++) {
                            console.log(botMatches[i].match);
                            options.push(botMatches[i].match);
                        }

                        optionMsg(options);
                        options = [];
                    }


                }
            },
            error: function (response) {
                console.log(response);
                var pixelResponse = {
                    score: 1,
                    match: 'Service Status',
                    response: 'The service is currently unavaliable ',
                    matchId: 0,
                };
                addPixelMessage(pixelResponse, true);
            }
        });
    }



    //var index is the id of the message
    var INDEX = 0;
    //generate messages on submit click
    $("#chat-submit").click(function (e) {
        e.preventDefault();
        msg = $("#chat-input__text").val();
        //if there is no string button send shoudn't work
        if (msg.trim() == '') {
            return false;
        }
        //call generate message function
        generate_message(msg, 'self');
        //send the message to bot
        callbot(msg);

        // bot answering back
        /*setTimeout(function () {
            generate_message(msg, 'bot');
            //time out animation for the bot answering back
        }, 1000)*/

    })

    function generate_message(msg, type) {
        //var index is the id of each message id =id+1
        INDEX++;
        var str = "";
        if (type == 'self') {
            str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + "\">";
            str += "          <div class=\"cm-msg-text\">";
            str += msg;
            str += "          <\/div>";
            str += "        <\/div>";

        } else {
            str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + "\">";
            str += "<span class=\"msg-avatar\">";
            /*str += "<i class=\"material-icons\">android<\/i>"*/
            str += "<img class=\"chat-box-overlay_robot\" src=\"ROBOT.png\">"
            str += "          <\/span>";
            str += "          <div class=\"cm-msg-text\">";
            str += msg;
            str += "          <\/div>";
            str += "        <\/div>";

        }


        //send the string to chat-log window
        $(".chat-logs").append(str);
        //message animation to show up on the screen with 500mls delay
        $("#cm-msg-" + INDEX).hide().fadeIn(500);

        //remove text from the input 
        if (type == 'self') {
            $("#chat-input__text").val('');
        }
        //auto scroll 
        $(".chat-logs").stop().animate({
            scrollTop: $(".chat-logs")[0].scrollHeight
        }, 1000);
    }

    var optionMsg = function generate_options(b) {
        /*what is the weather like in toronto now*/

        generate_message('Did you mean:', 'bot');

        var str = "";
        var i;
        for (i = 0; i < b.length; i++) {
            INDEX++;

            str = "<div id='cm-msg-" + INDEX + "' class=\"options\">";
            str += "<button class=\"options-btn\" >";
            str += b[i];
            str += "          <\/button>";
            str += "        <\/div>";

            //send the string to chat-log window
            $(".chat-logs").append(str);
            //message animation to show up on the screen with 500mls delay
            $("#cm-msg-" + INDEX).hide().fadeIn(500);
            console.log(b[i]);
        }
        //choose button option
        $(".options-btn").click(function (e) {
            e.preventDefault();
            var btnVal = $(this).html();
            console.log(btnVal);
            //show chosen option in the chat logs
            $(".chat-logs").append(function () {

                generate_message(btnVal, 'self');
                callbot(btnVal);
            });
        });
        /*b.length=0;*/
        b = [];



    }

    function guid() {

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function generateSessionKey() {

        var sessiondate = new Date().getTime();
        var sessionkey = 'xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (sessiondate + Math.random() * 16) % 16 | 0;
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        return sessionkey;
    }

    /*toggle animations*/
    $("#chat-circle").click(function () {
        $("#chat-circle").hide('scale');
        $(".chat-box").show('scale');
        $(".chat-box-welcome__header").show('scale');
    })

    $(".chat-box-toggle").click(function () {
        $("#chat-circle").show('scale');
        $(".chat-box").hide('scale');
        $(".chat-box-welcome__header").hide('scale');
        $("#chat-box__wraper").hide('scale');
    })

    $(".chat-input__text").click(function () {
        $(".chat-box-welcome__header").hide();
        $("#chat-box__wraper").show();
    })


})
