
function go(from, to, transition, reverse) {
    transition = transition || 'none';
    reverse = reverse || false;
    $('#'+from).fastClick(function(e) {$.mobile.changePage('#'+to, {transition : transition, reverse : reverse});});
}

//go('keybacktoroominfo', 'makeroom', 'slide', true);
$('#keybacktoroominfo').fastClick(function(e) {
    deleteRoom();
    $.mobile.changePage('#makeroom', { transition:'flow', reverse:true});
});

go('makeroombutton', 'makeroom', 'slide');

go('enterkeybutton', 'enterkey', 'slide');

$('#keygenbtn').fastClick(navig8);

go('makeroomtog2k', 'get2key', 'slide', true);

$('#enterkeytokkhome').fastClick(changeLink);

go('g2ktoexplainknoknok', 'explainknoknok', 'slide');

go('abouttoget2key', 'get2key', 'slide', true);

go('enterkeytog2k', 'get2key', 'slide', true);

//go('sendthiskey', 'sendkey', 'slide');

$('#sendthiskey').fastClick(function(e) {
  sendTheSMS();
});

function sendTheSMS() {
    try {
        var intent = "INTENT"; //leave empty for sending sms using default intent
        var success = function () {};
        var error = function (e) {};
        //get j.mp from server
        var req = new XMLHttpRequest;
        req.open('GET', 'http://ebcmdev.appspot.com/getbitly?roomkey='+getKey()+'&username='+getUserName());
        req.send();
        var link = "http://getknoknok.appspot.com";
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                if (req.responseText && (req.responseText == '' || req.responseText == "null")) {
                    link = "http://getknoknok.appspot.com";
                } else {
                    link = req.responseText;
                }
                message = "Hey, I downloaded a roommate app called Knoknok. Download it here: " + link;
                setNumberList();
                //numberArray = decodeURIComponent(numberArray.substring(0, numberArray.length - 1));
                //sms.send('15555555555', message, intent, success, error);
                setTimeout(function() {
                  window.location.href = '#KKhome';
                }, 2500);
                sms.send(' . - ()', message, intent, success, error);
                /*
                setTimeout(function() {
                    $('#phonenumbers')[0].innerHTML = '<input type="tel" name="sendnum1" id="sendnum1" placeholder="Cell Number...">';
                }, 2500)
                num_phone_numbers = 1;
                 */
            }
          //$.mobile.changePage('#KKhome', {transition:'flow',reverse:true});
        }
    } catch(e) {
        myAlert("Could not send text: " + e.message);
    }
    
}
$('#sendsmsbtn').fastClick(sendTheSMS);

$('#pastekeybtn').fastClick(function(e) {
    try{
        window.plugins.clipboard.paste(function (text) {
            insertKey(text);
        },
        function(text) {
            myAlert("You haven't copied the key yet!");
        });
    }catch(e) {
        myAlert("Error! Please report this to eric.bailey@tufts.edu: " + e.message);
    }
});

/*
   $('#createroomtoroom').fastClick(changeLink);
   */
$('#createroomtoroom').fastClick(function(e) {
    populateFields();
    $.mobile.changePage('#KKhome', { transition : 'pop', reverse : false});
});

// $('#emailtoroom').fastClick(function(e) {
//     $.mobile.changePage('#KKhome', { transition : 'pop', reverse : false});
// });

//$('#addroommateemail').fastClick(addEmailInput);

go('smstoemail', 'sendemail', 'slide', false);

go('abouttosettings', 'settingsmenu', 'slide', true);

//go('emailtosendkey', 'sendkey', 'slide', true);

go('smstocreateroom', 'createroom', 'slide', true);
/*
   go('smstokkhome', 'KKhome', 'flow', true);
$('#smstocreateroom').fastClick(function(e) {
    //deleteRoom();
    $.mobile.changePage('#createroom', {transition : 'slide', reverse : true});
});
*/

go('settingsbutton', 'settingsmenu', 'pop');
$('#settingstoabout').fastClick(function(e) {
    $('#abouttoget2key')[0].style.display = 'none';
    $('#abouttosettings')[0].style.display = 'block';
    $.mobile.changePage('#explainknoknok');
});

//$('#setnosave').fastClick(leave_custom);
//$.mobile.changePage('#KKhome', {transition : 'pop', reverse : true});

$('#KKstatusbuttons').fastClick(function(e) {
    pressed_button = true;
});

$('#customback').fastClick(hideControls);

$('#changeinfobtn').fastClick(function(e) {
    $('#newroomname')[0].value = $('#roomname')[0].innerHTML;
    $('#usernameinput')[0].value = getUserName();
    $.mobile.changePage('#changeusername', {transition : 'slide', reverse : false});
});

go('forgetroombtn', 'forgetroom', 'slide');

go('deleteroombtn', 'deleteroom', 'slide');

$('#settingsback').fastClick(function(e) {
    refresh();
    $.mobile.changePage('#KKhome', {transition:'pop',reverse:true});
});

go('changeunback', 'settingsmenu', 'slide', true);

$('#showkeysms').fastClick(function(e) {
  sendTheSMS();
});

  /*
$('#showkeysms').fastClick(function(e) {
    $('#phonenumbers')[0].innerHTML = '<input type="tel" name="sendnum1" id="sendnum1" placeholder="Cell Number...">';
    num_phone_numbers = 1;
    $('#smstocreateroom')[0].style.display = 'none';
    $('#smstokkhome')[0].style.display = 'block';
    $.mobile.changePage('#sendkey', {transition:'slide',reverse:false});
});
*/

//go('showkeyemail','sendemail', 'pop')

go('showkeybtn','showkeyscreen', 'slide')

go('showkeyback','settingsmenu', 'slide', true)

function changeInfo() {
    changeroomname();
    changeUserName();
    populateFields()
    refresh();
    $.mobile.changePage('#KKhome', {transition : 'flow', reverse : true});
}

$('#changeusernamebtn').fastClick(changeInfo);

//$('#statustext').fastClick(showControls);
$('#statustext:first-child').fastClick(showControls);

// $('#searchcontactsemail').fastClick(function(e) {
//     window.plugins.ContactPicker.chooseContact(function(contactInfo) {
//     });
// });

$('#searchcontactssms').fastClick(function(e) {
    var successCallback = function(result) {
        setTimeout(function(){
            $('#sendnum1')[0].value += result.phoneNumber+',';
            //$('#sendnum'+num_phone_numbers)[0].value = result.phoneNumber;
            //addPhoneInput();
        },0);
    };
    var failedCallback = function(result) {
        /*
        setTimeout(function(){
            myAlert('Error getting contact\'s phone! ' + result);
        },0);
        */
    }
    try {
        window.plugins.contactNumberPicker.pick(successCallback,failedCallback);
    } catch(e) {
      myAlert("ERROR! " + e.message);
    }
});

var disable_refresh = false;
$('#refresher').fastClick(function() {
    if (offline) return;
    $('#refresher')[0].innerHTML = 'Refreshing...';
    setTimeout(function() {
        if (disable_refresh) {
            $('#refresher')[0].innerHTML = 'Refreshed!';
            setTimeout(function() {
                $('#refresher')[0].innerHTML = 'Refresh';
            }, 2000);
            return;
        }
        refresh();
        $('#refresher')[0].innerHTML = 'Refreshed!';
        setTimeout(function() {
            $('#refresher')[0].innerHTML = 'Refresh';
        }, 2000);
    }, 750);
});

$('#forgetroomconfirm').fastClick(function(e) {
    forgetRoom();
    $.mobile.changePage('#get2key', {transition:'flow',reverse:true});
});
go('forgetroomback', 'settingsmenu', 'slide', true);

$('#errorbtn').fastClick(function(e) {
    forgetRoom();
    $.mobile.changePage('#get2key', {transition:'flow',reverse:true});
});

$('#deleteroomconfirm').fastClick(function(e) {
    deleteRoom();
    $.mobile.changePage('#get2key', {transition : 'flow', reverse : true});
});

go('deleteroomback', 'settingsmenu', 'slide', true);

addEnterListener('enterroomname', navig8); //makeroom
addEnterListener('enterfirstname', navig8); //makeroom
addEnterListener('roomkey1', changeLink); //enterkey
addEnterListener('username', changeLink); //enterkey
//addEnterListener('sendnum1', addPhoneInput); //sendsms
addEnterListener('sendnum1', sendTheSMS); //sendsms
addEnterListener('newroomname', changeInfo); //changeinfo
addEnterListener('usernameinput', changeInfo); //changeinfo
addEnterListener('statusinput', function(){ //KKhome
    leave_custom();
    document.getElementById("statusinput").setAttribute('onblur','');
});

