
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

go('enterkeytog2k', 'get2key', 'slide', true);

go('sendthiskey', 'sendkey', 'slide');

$('#pastekeybtn').fastClick(function(e) {
    alert("alright i'm in the fn. if you get another alert, then we kosher.");
    window.plugins.paste(function (text) {
        alert("D:D:D:D::DD:D:D:D:D");
        alert(text);
    },
    function(text) {
      alert("oh. nothing's in the whatever.");
    });
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

$('#addroommatephone').fastClick(addPhoneInput);

//$('#addroommateemail').fastClick(addEmailInput);

go('smstoemail', 'sendemail', 'slide', false);

go('emailtosendkey', 'sendkey', 'slide', true);

go('smstocreateroom', 'createroom', 'slide', true);

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

go('showkeysms','sendkey', 'pop')

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
    window.plugins.ContactPicker.chooseContact(function(contactInfo) {
        alert(contactInfo.displayName + " " + contactInfo.phoneNumbers);
    });
});

$('#forgetroomconfirm').fastClick(function(e) {
    console.log("roomkey was" + getKey());
    forgetRoom();
    console.log("roomkey is" + getKey());
    $.mobile.changePage('#get2key', {transition:'pop',reverse:true});
});
go('forgetroomback', 'settingsmenu', 'slide', true);

$('#deleteroomconfirm').fastClick(deleteRoom);

go('deleteroomback', 'settingsmenu', 'slide', true);

