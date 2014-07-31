
function go(from, to, transition, reverse) {
    transition = transition || 'none';
    reverse = reverse || false;
    $('#'+from).fastClick(function(e) {$.mobile.changePage('#'+to, {transition : transition, reverse : reverse});});
}

go('makeroombutton', 'makeroom', 'slide');

go('enterkeybutton', 'enterkey', 'slide');

$('#keygenbtn').fastClick(function(e) {navig8();});

go('makeroomtog2k', 'get2key', 'slide', true);

$('#enterkeytokkhome').fastClick(function(e) {changeLink();});

go('enterkeytog2k', 'get2key', 'slide', true);

go('sendthiskey', 'sendkey', 'slide');

$('#createroomtoroom').fastClick(function(e) {$.mobile.changePage('?roomkey='+getKey()+'#KKhome', { transition : 'pop', reverse : false});});

$('#addroommatephone').fastClick(addPhoneInput);

$('#addroommateemail').fastClick(addEmailInput);

go('smstoemail', 'sendemail', 'slide', false);

go('emailtosendkey', 'sendkey', 'slide', true);

go('smstocreateroom', 'createroom', 'slide', true);

go('settingsbutton', 'settingsmenu', 'pop');

go('opencustom', 'entercustom', 'pop');

$('#setnosave').fastClick(function(e) {setStatus($('#status').val());$.mobile.changePage('#KKhome', {transition : 'pop', reverse : true});});

$('#setsave').fastClick(function(e) {setStatus($('#status').val());saveText();$.mobile.changePage('#KKhome', {transition : 'pop', reverse : true});});

go('customback', 'KKhome', 'pop', true);

$('#errorbtn').fastClick(function(e) {$.mobile.changePage('/', {transition : 'slide', reverse : true});});

$('#changeunbtn').fastClick(function(e) {$('#usernameinput')[0].value = getUserName();$.mobile.changePage('#changeusername', {transition : 'slide', reverse : false});});

$('#changernbtn').fastClick(function(e) {$('#newroomname')[0].value = $('#roomname')[0].innerHTML;$.mobile.changePage('#changeroomname', {transition : 'slide', reverse : false});});

go('forgetroombtn', 'forgetroom', 'slide');

go('deleteroombtn', 'deleteroom', 'slide');

go('settingsback', 'KKhome', 'pop', true);

go('changeunback', 'settingsmenu', 'slide', true);

$('#changeusernamebtn').fastClick(changeUserName);

$('#changeroomnamebtn').fastClick(changeroomname);

go('changernback', 'settingsmenu', 'slide', true);

go('forgetroomback', 'settingsmenu', 'slide', true);

$('#deleteroomconfirm').fastClick(function(e) {forgetRoom();e.target.parentNode.submit();});

go('deleteroomback', 'settingsmenu', 'slide', true);

