//19BFA1 is a color (for this function - it's based on looking at the output of split('#'))
//#000000 is not!
String.prototype.isColor = function() {
    return /^[0-9A-F]{6}$/i.test(this);
}

var delay = 10500;

function startup() {
    alert('you just resumed or opened the app. todo: remove this alert');
    showControls();
    if (getKey()) {
        refresh();
        var interval = setInterval(refresh_info, delay);
        //reset_interval(delay);
    }
}

document.addEventListener("deviceready", startup, false);
document.addEventListener("resume", startup, false);

//clears the cookies for while we're testing
function clearCookies(debug) {
    if (debug) {
        localStorage.removeItem("username");
        localStorage.removeItem("userkey");
    }
}

//redirects to KKhome when there is a key in localStorage
function redirectWhenCookie() {
    var key = getKey(); 
    if(key && key != "" && key != null && key != "undefined" && key != "None") {
        window.location.href = '#KKhome';
    }
}

//this is for removing the title of apple alerts.
function myAlert(s) {
  var iframe = document.createElement("IFRAME");
  iframe.setAttribute("src", 'data:text/plain,');
  document.documentElement.appendChild(iframe);
  window.frames[0].window.alert(s);
  iframe.parentNode.removeChild(iframe);
}

//Changes the link to KKhome using the key in localStorage
function changeLink() {
    var key = $('#roomkey0')[0].value + $('#roomkey1')[0].value;
    if (key == undefined || (key.length != 6 && true/*key.length != 9)*/)) {
        myAlert('That doesn\'t look like a real key! Please try again.');
        return;
    }
    var req = new XMLHttpRequest;
    req.open('GET', 'http://ebcmdev.appspot.com/api?roomkey='+key);
    req.send();
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (req.responseText && (req.responseText == '' || req.responseText == "null")) {
                myAlert('That doesn\'t look like a real key! Please try again.');
                return;
            }
            localStorage.setItem("username", $('#username')[0].value);
            localStorage['userkey'] = Number(key);
            afterkeygen();
            $.mobile.changePage('#KKhome', {transition : 'slide'});
        }
    }
}

function afterkeygen() {
    $('#showkey')[0].innerHTML = formatKeyOutput();
    refresh_info();
    depth = 1;
    var interval = setInterval(refresh_info, delay);
}

function navig8() {
    localStorage.setItem("username", $('#enterfirstname')[0].value);
    $.mobile.changePage('#keyload', {transition : 'slide'});
    post_params = new Object();
    post_params['enterroomname'] = $('#enterroomname')[0].value;
    //$.post('/createroom', post_params, function(data) {
    $.post('http://ebcmdev.appspot.com/createroom', post_params, function(data) {
        if (data != "") {
            localStorage['userkey'] = Number(data);
        }
        setTimeout(function() {
            $('#forget_key_display')[0].innerHTML = formatKeyOutput();
            makeKey();
            afterkeygen();
            var path = '#createroom';
            $.mobile.changePage(path, {transition : 'slide'});
        },3000);
    });
}


function formatKeyOutput(keystr) {
    keystr = keystr || getKey();
    var keyoutput = "";
    for (var i = 0; i < 6; i++) {
        if (i != 0 && i % 3 === 0) {
            keyoutput += '-';
        }
        if (keystr)
            keyoutput += keystr[i];
    }
    return keyoutput;
}

function makeKey() {
    var keyoutput = formatKeyOutput();
    $('#key')[0].innerHTML = "Key: " + keyoutput;
    $('#keytosendsms')[0].innerHTML = "Key: " + keyoutput;
    $('#forget_key_display')[0].innerHTML = formatKeyOutput();
    $('#delete_key_display')[0].innerHTML = formatKeyOutput();
}

//displays the key from the cookie
function displayKeyToSend(){
    $('#keytosend')[0].innerHTML = getKey();
    //$('#keytosendemail')[0].innerHTML = getKey();
}

var num_phone_numbers = 1;
//adds a new phone input slot for sendsms
function addPhoneInput() {
    num_phone_numbers++;
    var i = num_phone_numbers;
    $('#phonenumbers input:last').after('<input type="tel" name="sendnum'+i+'" id="sendnum'+i+'" placeholder="Cell Number...">');
    addEnterListener('sendnum'+i, addPhoneInput);
    $('#sendnum'+i).focus();
}

var numberArray = "";
function setNumberList() {
    numberArray = '';
    for (var i = 1; i < num_phone_numbers + 1; i++) {
        numberArray += $("#sendnum" + i).val();
        numberArray += " ";
    }
}

function deleteRoom() {
    var post_params = new Object();
    post_params['roomkey'] = getKey();
    //$.post('http://ebcmdev.appspot.com/sign', post_params, function() {});
    $.post('http://ebcmdev.appspot.com/deleteroom',post_params, function() {
        forgetRoom();
        $.mobile.changePage('#get2key', {transition:'pop',reverse:true});
    });
}

function sendsms() {
    setNumberList();
    var post_params = new Object();
    post_params['username'] = getUserName();
    post_params['roomkey'] = getKey();
    post_params['sendnum'] = numberArray;
    $.post('http://ebcmdev.appspot.com/sendsms', post_params, function(){
        $.mobile.changePage('#KKhome', { transition:"pop" });
    });
}

// SLATED FOR REMOVAL
// var num_emails = 1;
// //adds a new email input slot for sendemail
// function addEmailInput() {
//     num_emails++;
//     var i = num_emails;
//     $('#emailinputs input:last').after('<input type="email" name="email'+i+'" id="email'+i+'" placeholder="Email Address...">');
//     addEnterListener('email'+i, addEmailInput);
//     $('#email'+i).focus();
// }

// var emailArray = "";
// function setEmailList() {
//     emailArray = "";
//     for (var i = 1; i < num_emails + 1; i++) {
//         emailArray += $("#email" + i).val();
//         emailArray += " ";
//     }
// //document.getElementById("emaillist").value = emailArray;
// }

// function sendemail() {
//     setEmailList();
//     var post_params = new Object();
//     post_params['roomkey'] = getKey();
//     post_params['emailsentby'] = getUserName();
//     post_params['emails'] = emailArray;
//     $.post('http://ebcmdev.appspot.com/sendemail', post_params, function(){
//         $.mobile.changePage('#KKhome', { transition:"pop" });
//         //window.location.assign('#KKhome');
//     });
// }

function setColor(msg) {
    var color = '#006eb7';
    var split_msg = msg.split('#');
    // if it's a valid color
    if (split_msg[split_msg.length - 1].isColor()) {
        color = '#' + split_msg[split_msg.length - 1];
    }
    else if (msg == 'Open') {
        color = '#00FF00';
    }
    else if (msg == 'Closed') {
        color = '#FF0000';
    }
    $('#statusbar')[0].style.borderColor = color;
    $('#statusbar')[0].style.color = color;
}

function refresh() {
    var req = new XMLHttpRequest;
    //depth += 1;
    console.log('updating info with delay: ' + deli / 1000 + 's');
    if (getKey() && getKey() != null && getKey() != "null") {
        req.open('GET', 'http://ebcmdev.appspot.com/api?roomkey='+getKey());
        req.send();
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                var info = JSON.parse(req.responseText);
                localRefresh(decodeURIComponent(info['status']), decodeURIComponent(info['username']), decodeURIComponent(info['time']), decodeURIComponent(info['roomname']));
                //$('#statusinput')[0].setAttribute('placeholder', info['status']);
            }
        }
    }
}

var depth = 1;
var deli = delay;

function reset_interval(dly) {
    if (interval) 
        clearInterval(interval);
    if (getKey()) {
        interval = setInterval(refresh_info, dly);
    }
}

function refresh_info() {
    refresh();
    //slowly make it stop spamming the server if theyre idle
    //idk maybe rething how the scaling works.
    //  10s 10s 10s 20s 20s 20s 30s 30s 30s 40s 40s 40s etc.
    console.log("depth: " + depth);
    if (depth % 3 == 0) {
        deli = (depth/3 + 1) * delay;
        reset_interval(deli);
    }
    depth += 1;
}

if (getKey() && getKey() != null && getKey() != "null") {
    depth = 1;
    //refresh();
    var interval = setInterval(refresh_info, delay);
}
else console.log("No roomkey loaded yet.");

//just updates the status locally, doesn't send/get any info from the server
function localRefresh(msg, username, time, roomname) {
    setColor(msg);
    var split_msg = msg.split('#');
    // if it's a valid color, hide the color.
    if (split_msg[split_msg.length - 1].isColor()) {
        msg = msg.substring(0, msg.lastIndexOf("#"));
    }
    $('#statustext')[0].innerHTML = msg;
    if (username && username != '') {
        $('#statusstats')[0].innerHTML = 'set by: ' + username
    } else {
        $('#statusstats')[0].innerHTML = '<br>'
    }
    if (time) {
        if (username && username != '') $('#statusstats')[0].innerHTML += ',';
        else $('#statusstats')[0].innerHTML = 'set';
        $('#statusstats')[0].innerHTML += ' ' + time;
    }
    if (roomname != null) {
        $('#roomname')[0].innerHTML = roomname;
    }
}

function showControls() {
    var s = $('#statustext')[0].innerHTML; 
    if (s && s != '')
        $('#statusinput')[0].value = $('#statustext')[0].innerHTML;
    $('#statusinput')[0].style.display = 'block';
    if (s && s != '')
        $('#statusinput').height($('#statustext')[0].offsetHeight);
    $('#statustext')[0].style.display = 'none';
    $('#KKstatusbuttons')[0].style.display = 'block';
    $('#statusinput').focus();
    $('#statusinput').select();
    $('#statusinput')[0].setSelectionRange(0, 9999);
}

function hideControls() {
    $('#KKstatusbuttons')[0].style.display = 'none';
    $('#statustext')[0].style.display = 'block';
    var s = $('#statustext')[0].innerHTML; 
    if (s && s != '')
        $('#statusinput')[0].value = s
    $('#statusinput')[0].style.display = 'none';
}

//makes the status something
//msg: string to be set at the status
//update: bool, whether or not to update the time it was set at
function setStatus(msg, update) {
    if (msg == '')
        return
    hideControls();
    //if i have time/willpower/reason to do this, make a spinner popup thing that will keep going if they don't have internet. this should work instantly though if they do have internet
    //we want this to feel immediate
    var post_params = new Object();
    var username = getUserName();
    if (update) {
        post_params['update'] = '1';
        localRefresh(msg, username);
    }
    else {
        pressed_button = true;
        localRefresh(msg, username, 'just now');
    }
    post_params['roomkey'] = getKey();
    post_params['username'] = username;
    if (msg && msg != '') {
        post_params['status'] = msg;
        console.log(post_params);
    }else{
        console.log("WHAT. " + msg);
    }
    $.post('http://ebcmdev.appspot.com/sign', post_params, function() {});
    //they are active -> refresh frequently
    depth = 1;
    deli = delay;
    reset_interval(deli);
}

function destroyButton(i) {
    pressed_button=true;
    var statuslist = localStorage.getItem("statuslist");
    if (statuslist === null) return;
    statuslist = JSON.parse(statuslist);
    var currButton = $('#KKstatusbuttons')[0].firstChild.nextSibling.nextSibling.nextSibling;
    statuslist.splice(i, 1);
    if (statuslist.length > 0) {
        localStorage.setItem("statuslist", JSON.stringify(statuslist));
    }
    else {
        localStorage.setItem('statuslist', JSON.stringify([]));
        //localStorage.removeItem("statuslist");
    }
    var nextButton;
    while (currButton) {
      nextButton = currButton.nextSibling;
      currButton.parentNode.removeChild(currButton);
      currButton = nextButton;
    }
    addExtraButtons();
}

function addExtraButton(msg, i) {
    btn = document.createElement("a");
    btn.href="javascript:;";
    btn.className = "ui-btn";
    btn.setAttribute("onclick", "pressed_button=true;setStatus('"+msg+"');");
    var split_msg = msg.split('#');
    if (split_msg[split_msg.length - 1].isColor()) {
        btn.style.color = '#' + split_msg[split_msg.length - 1];
        msg = msg.substring(0, msg.lastIndexOf("#"));
    }
    btn.innerHTML = msg;
    close = document.createElement("span");
    close.addEventListener('click', function(element){
        this.parentNode.removeAttribute('onclick');
    });
    close.setAttribute("onclick", "destroyButton("+i+");");
    close.style.color = "red";
    close.style.cssFloat = "right";
    close.style.textDecoration = "none";
    close.style.right = "5px";
    close.innerHTML = 'x';
    btn.appendChild(close);
    var div = document.getElementById("KKstatusbuttons");
    div.appendChild(btn);
}

function addExtraButtons() {
    //localStorage.removeItem("statuslist");
    var statuslist = localStorage.getItem("statuslist");
    if (statuslist === null) return;
    console.log(statuslist);
    statuslist = JSON.parse(statuslist);
    console.log(statuslist);
    var input, btn;
    var len = statuslist.length;
    for (var i=0; i < len; i++) {
        addExtraButton(statuslist[i], i);
    }
}

//whether or not a button was pressed to get out of the blur!
var pressed_button = false;

//set the status according to the box
function leave_custom() {
    if (!pressed_button) {
        s = $('#statusinput').val();
        if (s != $('#statustext')[0].innerHTML) {
            console.log(s);
            console.log("here...");
            setStatus(s); //setStatus hides the controls if good input.
        }
        else hideControls();
    }
}

//remembers the custom status in memory
function saveText() {
    savestatus = document.getElementById("statusinput").value;
    var statuslist = localStorage.getItem("statuslist");
    if (!statuslist || statuslist == null) {
        statuslist = [savestatus];
    } 
    else {
        statuslist = JSON.parse(statuslist);
        statuslist.push(savestatus);
    }
    localStorage.setItem("statuslist", JSON.stringify(statuslist));
    addExtraButton(savestatus, statuslist.length - 1);
    //document.getElementById("statusinput").value = '';
}

//deletes the cookie
function forgetRoom(){
    clearInterval(interval);
    localStorage.removeItem("userkey");
}

function changeUserName() {
    var oldname  = getUserName();
    var username = document.getElementById('usernameinput').value; 
    var key = localStorage.setItem('username', username);
    //maybe have it update the previously updated status? it still shows the older status
    var stats = $('#statusstats')[0].innerHTML;
    //if they set the most recent status
    if (stats.split(',')[0] == 'set by: ' + oldname || 
        (oldname == '' && stats.split(',')[0] == stats)) {//if they didn't set a name
            setStatus($('#statustext')[0].innerHTML, true); //reset the status
    }
    $.mobile.changePage('#KKhome', {transition : 'flow', reverse : true});
}

function getKey() {
    var k = localStorage.getItem("userkey"); 
    if (k != "NaN")
        return k;
    else return null;
}

function getUserName() {
    return localStorage.getItem("username");
}

function changeroomname() {
    var post_params = new Object();
    post_params['roomkey'] = getKey();
    post_params['roomname'] = $('#newroomname').val();
    $('#roomname')[0].innerHTML = post_params['roomname'];
    $.mobile.changePage('#KKhome', {transition : 'flow', reverse : true});
    $.post('http://ebcmdev.appspot.com/changeroomname', post_params, function(){
    });
}

