
function go(from, to, transition, reverse) {
    transition = transition || 'none';
    reverse = reverse || false;
    $('#'+from).fastClick(function(e) {$.mobile.changePage('#'+to, {transition : transition, reverse : reverse});});
}

go('makeroombutton', 'makeroom', 'slide');

go('enterkeybutton', 'enterkey', 'slide');

$('#keygenbtn').fastClick(navig8);

go('makeroomtog2k', 'get2key', 'slide', true);

$('#enterkeytokkhome').fastClick(changeLink);

go('enterkeytog2k', 'get2key', 'slide', true);

go('sendthiskey', 'sendkey', 'slide');

$('#createroomtoroom').fastClick(function(e) {
    $.mobile.changePage('#KKhome', { transition : 'pop', reverse : false});
});

$('#addroommatephone').fastClick(addPhoneInput);

$('#addroommateemail').fastClick(addEmailInput);

go('smstoemail', 'sendemail', 'slide', false);

go('emailtosendkey', 'sendkey', 'slide', true);

go('smstocreateroom', 'createroom', 'slide', true);

go('settingsbutton', 'settingsmenu', 'pop');

/* SLATED FOR REMOVAL
go('opencustom', 'entercustom', 'pop');
*/

$('#setnosave').fastClick(function(e) {
    setStatus($('#statusinput').val());
    $.mobile.changePage('#KKhome', {transition : 'pop', reverse : true});
});

$('#setsave').fastClick(function(e) {
    setStatus($('#statusinput').val());
    saveText();
    $.mobile.changePage('#KKhome', {transition : 'pop', reverse : true});
});

//go('customback', 'KKhome', 'pop', true);
    
$('#customback').fastClick(hideControls);

$('#errorbtn').fastClick(function(e) {
    $.mobile.changePage('/templates/index.html', {transition : 'slide', reverse : true});
});

$('#changeinfobtn').fastClick(function(e) {
    $('#newroomname')[0].value = $('#roomname')[0].innerHTML;
    $('#usernameinput')[0].value = getUserName();
    $.mobile.changePage('#changeusername', {transition : 'slide', reverse : false});
});

//SLATED FOR REMOVAL
/*
$('#changernbtn').fastClick(function(e) {
    $.mobile.changePage('#changeroomname', {transition : 'slide', reverse : false});
});
*/

go('forgetroombtn', 'forgetroom', 'slide');

go('deleteroombtn', 'deleteroom', 'slide');

go('settingsback', 'KKhome', 'pop', true);

go('changeunback', 'settingsmenu', 'slide', true);

go('showkeysms','sendkey', 'pop')

go('showkeyemail','sendemail', 'pop')

go('showkeybtn','showkeyscreen', 'slide')

go('showkeyback','settingsmenu', 'slide', true)

$('#changeusernamebtn').fastClick(changeUserName);

$('#changeroomnamebtn').fastClick(changeroomname);

//$('#statustext').fastClick(showControls);
$('#statustext:first-child').fastClick(showControls);
//$('#KKhomebody').fastClick(showControls);

//SLATED FOR REMOVAL
//go('changernback', 'settingsmenu', 'slide', true);

$('#seachcontactssms').fastClick(function(e) {
    window.plugins.ContactPicker.chooseContact(function(contactInfo) {
        alert(contactInfo.displayName + " " + contactInfo.email);
    });
});

$('#forgetroomconfirm').fastClick(function(e) {
    forgetRoom();
    $.mobile.changePage('#get2key', {transition:'pop',reverse:true});
});
go('forgetroomback', 'settingsmenu', 'slide', true);

$('#deleteroomconfirm').fastClick(function(e) {
    $.post('http://ebcmdev.appspot.com/deleteroom',{'roomkey':getKey()}, function() {
        forgetRoom();
        $.mobile.changePage('#get2key', {transition:'pop',reverse:true});
    });
});

go('deleteroomback', 'settingsmenu', 'slide', true);

