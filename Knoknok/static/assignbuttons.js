
function go(from, to, transition, reverse) {
    transition = transition || 'none';
    reverse = reverse || false;
    $('#'+from).fastClick(function(e) {$.mobile.changePage('#'+to, {transition : transition, reverse : reverse});});
}

go('keybacktoroominfo', 'makeroom', 'slide', true);

go('makeroombutton', 'makeroom', 'slide');

go('enterkeybutton', 'enterkey', 'slide');

$('#keygenbtn').fastClick(navig8);

go('makeroomtog2k', 'get2key', 'slide', true);

$('#enterkeytokkhome').fastClick(changeLink);

go('g2ktoexplainknoknok', 'explainknoknok', 'slide');

go('abouttoget2key', 'get2key', 'slide', true);

go('enterkeytog2k', 'get2key', 'slide', true);

go('sendthiskey', 'sendkey', 'slide');

$('#pastekeybtn').fastClick(function(e) {
  try{
    window.plugins.clipboard.paste(function (text) {
        myAlert('"' + text + '"');
        insertKey(text);
    },
    function(text) {
        myAlert("You haven't copied the key yet!");
    });
    }catch(e) {myAlert(e.message);}
});

$('#createroomtoroom').fastClick(function(e) {
    $.mobile.changePage('#KKhome', { transition : 'pop', reverse : false});
});
$('#smstoroom').fastClick(function(e) {
    $.mobile.changePage('#KKhome', { transition : 'pop', reverse : false});
});
// $('#emailtoroom').fastClick(function(e) {
//     $.mobile.changePage('#KKhome', { transition : 'pop', reverse : false});
// });

//$('#addroommatephone').fastClick(add Phone Input);

//$('#addroommateemail').fastClick(addEmailInput);

go('smstoemail', 'sendemail', 'slide', false);

go('emailtosendkey', 'sendkey', 'slide', true);

//go('smstocreateroom', 'createroom', 'slide', true);
$('#smstocreateroom').fastClick(function(e) {
    deleteRoom();
    $.mobile.changePage('#createroom', {transition : 'flow', reverse : true});
});

go('settingsbutton', 'settingsmenu', 'pop');

//$('#setnosave').fastClick(leave_custom);
//$.mobile.changePage('#KKhome', {transition : 'pop', reverse : true});

$('#KKstatusbuttons').fastClick(function(e) {
    pressed_button = true;
});

$('#setsave').fastClick(function(e) {
    saveText();
    pressed_button = false;
    leave_custom();
    pressed_button = true;
    //$.mobile.changePage('#KKhome', {transition : 'pop', reverse : true});
});

$('#customback').fastClick(hideControls);

$('#errorbtn').fastClick(function(e) {
    $.mobile.changePage('/templates/index.html', {transition : 'slide', reverse : true});
});

$('#deletestatibtn').fastClick(function(e) {
    localStorage['statuslist'] = '["Open#00FF00", "Closed#FF0000"]';
    $.mobile.changePage('#KKhome', {transition : 'flow', reverse : true});
});

$('#changeinfobtn').fastClick(function(e) {
    $('#newroomname')[0].value = $('#roomname')[0].innerHTML;
    $('#usernameinput')[0].value = getUserName();
    $.mobile.changePage('#changeusername', {transition : 'slide', reverse : false});
});

go('forgetroombtn', 'forgetroom', 'slide');

go('deleteroombtn', 'deleteroom', 'slide');

go('settingsback', 'KKhome', 'pop', true);

go('changeunback', 'settingsmenu', 'slide', true);

//go('showkeysms','sendkey', 'pop')
$('#showkeysms').fastClick(function(e) {
    for (var i=0; i < num_phone_numbers; i++) {
        $('#sendnum'+i).remove();
    }
    num_phone_numbers = 0;
    addPhoneInput();
    go('smstocreateroom', 'KKhome', 'flow', true);
    $.mobile.changePage('#sendkey', {transition:'flow',reverse:true});
});

//go('showkeyemail','sendemail', 'pop')

go('showkeybtn','showkeyscreen', 'slide')

go('showkeyback','settingsmenu', 'slide', true)

$('#changeusernamebtn').fastClick(changeUserName);

$('#changeroomnamebtn').fastClick(changeroomname);

//$('#statustext').fastClick(showControls);
$('#statustext:first-child').fastClick(showControls);

// $('#searchcontactsemail').fastClick(function(e) {
//     window.plugins.ContactPicker.chooseContact(function(contactInfo) {
//         alert(contactInfo.displayName + " " + contactInfo.emails);
//         alert(contactInfo.email);
//     });
// });

$('#searchcontactssms').fastClick(function(e) {
    var successCallback = function(result) {
        setTimeout(function(){
            $('#sendnum'+num_phone_numbers)[0].value = result.phoneNumber;
            addPhoneInput();
        },0);
    };
    var failedCallback = function(result) {
        setTimeout(function(){
            myAlert('Error getting contact\'s phone! ' + result);
        },0);
    }
    try {
        window.plugins.contactNumberPicker.pick(successCallback,failedCallback);
    } catch(e) {
      myAlert("ERROR! " + e.message);
    }
});

$('#forgetroomconfirm').fastClick(function(e) {
    console.log("roomkey was" + getKey());
    forgetRoom();
    console.log("roomkey is" + getKey());
    $.mobile.changePage('#get2key', {transition:'flow',reverse:true});
});
go('forgetroomback', 'settingsmenu', 'slide', true);

$('#deleteroomconfirm').fastClick(function(e) {
    deleteRoom();
    $.mobile.changePage('#get2key', {transition : 'flow', reverse : true});
});

go('deleteroomback', 'settingsmenu', 'slide', true);

