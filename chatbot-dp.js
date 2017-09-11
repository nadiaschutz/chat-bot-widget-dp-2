//wrapping out the code inside the function
/*$(function () {*/

// Localize jQuery variable
/*var jQuery;*/

/******** Load jQuery if not present *********/
/*if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.4.2') {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src",
        "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
    if (script_tag.readyState) {
      script_tag.onreadystatechange = function () { // For old versions of IE
          if (this.readyState == 'complete' || this.readyState == 'loaded') {
              scriptLoadHandler();
          }
      };
    } else { // Other browsers
      script_tag.onload = scriptLoadHandler;
    }
    // Try to find the head, otherwise default to the documentElement
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
} else {
    // The jQuery version on the window is the one we want to use
    jQuery = window.jQuery;
    main();
}*/

/******** Called once jQuery has loaded ******/
/*function scriptLoadHandler() {
    // Restore $ and window.jQuery to their previous values and store the
    // new jQuery in our local jQuery variable
    jQuery = window.jQuery.noConflict(true);
    // Call our main function
    main(); 
}*/

/******** Our main function ********/

// 
jQuery(document).ready(function ($) {

    const testing = false;

    const url = "https://prodbm-dot-deeppixel-corebot.appspot.com";
    //const url = "";
    const serversecret = "XIV97UQ8HCFP718X";
    const sessionkey = generateSessionKey();
    const DPID = "9cb6c6b8-1055-4417-b5c7-e19aaae95ff4";

    const build = testing ? "dist" : "dist";
    const MAX_SINGLE_REPLY_COUNT = 120;

    const TOP_THRESHOLD = 0.9;
    const BOTTOM_THRESHOLD = 0.6;

    var msg = "";
    var bot_msg, didYouMean, botScore;
    var options = [];

    /*model*/
    function callbot(message) {

        var endpoint = url + '/webapi?dpid=' + DPID + '&phrase=' + encodeURIComponent(message) + '&channel=' + sessionkey + '&threshold=' + TOP_THRESHOLD + '&threshlow=' + BOTTOM_THRESHOLD;
        /* const endpoint={
             url : "https://prodbm-dot-deeppixel-corebot.appspot.com",
             webApi : '/webapi?dpid=',
             DPID : "9cb6c6b8-1055-4417-b5c7-e19aaae95ff4",
             phrase : '&phrase=',
         }*/

        $.ajax({
            type: "get",
            async: false,
            url: endpoint,
            dataType: "jsonp",
            //jsonp: "jsonCallback",
            //jsonpCallback: "jsonCallback",
            beforeSend: function () {
                $(".spin-container").show();
            },
            complete: function () {
                $(".spin-container").hide();
            },
            success: function (response) {
                //Query the jQuery object for the values
                bot_msg = response.data.response;
                bot_score = response.data.score;

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
                            options.push(botMatches[i].match);
                        }
                        optionMsg(options);
                        options = [];
                    }
                }
            },
            error: function (response) {
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

    /*controller*/
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
    /*view*/
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

    /*view*/
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
        }
        //choose button option
        $(".options-btn").click(function (e) {
            e.preventDefault();
            var btnVal = $(this).html();
            //show chosen option in the chat logs
            $(".chat-logs").append(function () {
                generate_message(btnVal, 'self');
                callbot(btnVal);
            });
        });
        /*b.length=0;*/
        b = [];
    }
    /*model*/
    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    /*model*/
    function generateSessionKey() {
        var sessiondate = new Date().getTime();
        var sessionkey = 'xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (sessiondate + Math.random() * 16) % 16 | 0;
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return sessionkey;
    }
    /*controller*/
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
});

/*})();*/
