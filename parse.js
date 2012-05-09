var nullUser = {
    updateData : function () { "use strict"; },
    isSignedIn : false
};
var parseUser = nullUser;

function configureForms() {
    "use strict";
    $('.default').each(function () {
        var defaultVal = $(this).attr('title');
        $(this)
            .focus(function () {
                if ($(this).val() === defaultVal){
                    $(this).removeClass('defaultValue').val('');
                }
            })
            .blur(function () {
                if ($(this).val() === ''){
                    $(this).addClass('defaultValue').val(defaultVal);
                }
            })
            .blur();
    });
    $('form').submit(function () {
        $('.default').each(function () {
            var defaultVal = $(this).attr('title');
            if ($(this).val() === defaultVal) {
                $(this).val('');
            }
        });
    });
}

function clearError() {
    "use strict";
    $('.error').css({visibility: 'hidden'});
}

function onAuthentication(response) {
    "use strict";
    parseUser = response;
    $.parse.get('userState', {
        where : { userID : parseUser.objectId }
    }, function(response) {
        if (response.results.length === 0) {
            var userState = getUserState();
            // user state already stored as JSON string
            $.parse.post('userState', JSON.parse(userState), function(response){
                parseUser.userStateParseObjectId = response.objectId;
            }, showParseError);
        } else {
            setUserState(response.results[0]);
        }
    }, showParseError);
    parseUser.updateData = function () {
        var userState = JSON.parse(getUserState());
        $.parse.put('userState/' + parseUser.userStateParseObjectId, userState, function(){
            console.warn('updateData complete');
        }, showParseError);
    };
    parseUser.isSignedIn = true;
    $('.signIn').css({display: 'none'});
    $('.signOut').css({display: 'block'});
}

function showParseError(response) {
    "use strict";
    var error = JSON.parse(response.responseText);
    $('.errorNumber').text(error.code);
    $('.errorMessage').text(error.error);
    $('.error')
        .css({visibility: 'visible'})
        .click(clearError);
}

function signOut() {
    "use strict";
    parseUser = nullUser;
    $('.signIn').css({display: 'block'});
    $('.signOut').css({display: 'none'});
}

function signIn() {
    "use strict";
    var emailAddress = $('#emailAddress').val();
    var password = $('#password').val();
    $.parse.login(emailAddress, password, onAuthentication, showParseError);
}

function signUp() {
    "use strict";
    clearError();
    var emailAddress = $('#emailAddress').val();
    var password = $('#password').val();
    configureForms();
    $.parse.signup({
        username : emailAddress,
        password : password,
        email : emailAddress
    }, function (response) {
        onAuthentication(response);
        parseUser.updateData();
    }, function (response) {
        var result = JSON.parse(response.responseText);
        if (result.code === 202) {
            signIn();
        } else {
            showParseError(response);
        }
    });
}

$(document).ready(function () {
    "use strict";
    configureForms();
    $.parse.init({
        app_id : "yvnEoStBUE7pBbKZeEzdpb68A6nqBmXMhnW7LQO6",
        rest_key : "yjRYJ5BZzCJYkd6Mb1nxeWA4tskOkD5KdYUEMyOv"
    });
});
