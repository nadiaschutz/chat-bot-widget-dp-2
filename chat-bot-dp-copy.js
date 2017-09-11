var botController = (function (message) {

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

    var bot_msg, didYouMean, botScore;
    var options = [];
    var endpoint = url + '/webapi?dpid=' + DPID + '&phrase=' + encodeURIComponent(message) + '&channel=' + sessionkey + '&threshold=' + TOP_THRESHOLD + '&threshlow=' + BOTTOM_THRESHOLD;

    /*  function guid() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              var r = Math.random() * 16 | 0,
                  v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
          });
      }*/

    function generateSessionKey() {
        var sessiondate = new Date().getTime();
        var sessionkey = 'xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (sessiondate + Math.random() * 16) % 16 | 0;
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return sessionkey;
    }


    return {
        callbot: function (message) {

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

                            var i;
                            var botMatches = response.data.matches;
                            for (i = 0; i < botMatches.length; i++) {
                                options.push(botMatches[i].match);
                            }
                            optionMsg(options);
                            options = [];
                        }
                    }
                }
                /*,
                error: function (response) {
                    var pixelResponse = {
                        score: 1,
                        match: 'Service Status',
                        response: 'The service is currently unavaliable ',
                        matchId: 0,
                    };
                    addPixelMessage(pixelResponse, true);
                }*/
            });
        }
    }

})();

var uiController = (function () {
    var DOMstrings = {
        /* textMessage: "#chat-input__text",*/
        chatCircle: "#chat-circle",
        chatBox: ".chat-box",
        chatBoxClose: ".chat-box-toggle",
        chatBoxWelcome: ".chat-box-welcome__header",
        chatWraper: "#chat-box__wraper",
        chatInput: "#chat-input__text",
        chatInput0: "chat-input__text",
        submitBtn: "#chat-submit",
        chatLogs: ".chat-logs"

    }
    //var index is the id of the message
    var INDEX = 0;
    return {
        getInput: function () {
            return {
                message: document.getElementById(DOMstrings.chatInput0).value
            }

        },
        getDOMstings: function () {
            return DOMstrings;
        },
        generate_message: function (msg, type) {

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
            $(DOMstrings.chatLogs).append(str);
            //message animation to show up on the screen with 500mls delay
            $("#cm-msg-" + INDEX).hide().fadeIn(500);

            //remove text from the input 
            if (type == 'self') {
                $(DOMstrings.chatInput).val('');
            }
            //auto scroll 
            $(DOMstrings.chatLogs).stop().animate({
                scrollTop: $(DOMstrings.chatLogs)[0].scrollHeight
            }, 1000);
        },
        optionMsg: function (b) {
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
                $(DOMstrings.chatLogs).append(str);
                //message animation to show up on the screen with 500mls delay
                $("#cm-msg-" + INDEX).hide().fadeIn(500);
            }
            b = [];
        }
    };

})();

var controller = (function (botCntr, uiCntr) {
    var DOMst = uiCntr.getDOMstings();



    /*toggle*/
    function hideCircle(evt) {
        evt.preventDefault();
        $(DOMst.chatCircle).hide('scale');
        $(DOMst.chatBox).show('scale');
        $(DOMst.chatBoxWelcome).show('scale');
    }

    function chatBoxCl(evt) {
        evt.preventDefault();
        $(DOMst.chatCircle).show('scale');
        $(DOMst.chatBox).hide('scale');
        $(DOMst.chatBoxWelcome).hide('scale');
        $(DOMst.chatWraper).hide('scale');
    }

    function chatOpenMessage(evt) {
        evt.preventDefault();
        $(DOMst.chatBoxWelcome).hide();
        $(DOMst.chatWraper).show();
    }

    //generate messages on submit click
    function submitMsg(evt) {
        evt.preventDefault();

        //1. get input message data
        /*msg = $chatInput.val();*/
        var input = uiCntr.getInput();
        console.log(input);

        //2.if there is no string button send shoudn't work
        if (input.message.trim() == '') {
            return false;
        }
        m = $(uiCntr.getInput).val();
        //4. display message to ui controller
        uiCntr.generate_message(m, 'self');
        //3. add message to bot controller
        botCntr.callbot(m);
    }

    //choose button option
    $(".options-btn").click(function (e) {
        e.preventDefault();
        var btnVal = $(this).html();
        //show chosen option in the chat logs
        $(DOMst.chatLogs).append(function () {
            uiCntr.generate_message(btnVal, 'self');
            botCntr.callbot(btnVal);
        });
    });




    $(document).ready(function () {
        msg = (DOMst.chatInput).value;

        //1. call toggle 
        $(DOMst.chatCircle).on("click", hideCircle);
        $(DOMst.chatBoxClose).on("click", chatBoxCl);
        $(DOMst.chatInput).on("click", chatOpenMessage);

        //2. call wait message from CRM-human

        $(DOMst.submitBtn).on("click", submitMsg);

        //6. get message from bot controller-back end
        //7. display bot message to ui controller



    });


})(botController, uiController);
