//19BFA1 is a color (for this function - it's based on looking at the output of split('#'))
//#000000 is not!
String.prototype.isColor = function() {
    return /^(#|)[0-9A-F]{6}$/i.test(this);
}

//http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

var delay = 15585; //ms
var MAX_SAVED_STATI = 128; //since it's a dropdown (more input doesn't take up more space),
                           //i see no reason to cap it at 5

function startup() {
    $.mobile.changePage('#KKhome', {transition : 'slide'});
    alert('you just resumed or opened the app. todo: remove this alert');
    //showControls();
    if (getKey()) {
        refresh();
        //var interval = setInterval(refresh_info, delay);
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
    post_params['enterroomname'] = encodeURIComponent($('#enterroomname')[0].value);
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
        //$.mobile.changePage('#get2key', {transition:'pop',reverse:true});
    });
}

function sendsms() {
    setNumberList();
    var post_params = new Object();
    post_params['username'] = encodeURIComponent(getUserName());
    post_params['roomkey'] = getKey();
    post_params['sendnum'] = encodeURIComponent(numberArray);
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

//returns the color for the given msg
function get_coloring(msg, default_color) {
    var color = default_color || "#000000";
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
    return color;
}

function setColor(msg) {
    var color = get_coloring(msg, '#006eb7');
    if (color != '#000000') {
        $('#statusbar')[0].style.borderColor = color;
        $('#statusbar')[0].style.color = color;
    }
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
    setTimeout(refresh, 6000);
    setTimeout(refresh, 12000);
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
function select_input() {
    //window.document.execCommand('SelectAll', true);
    setTimeout(function() {
        var $this = $("#statusinput");
        $this.select();

        // Work around Chrome's little problem
        $this.mouseup(function() {
            // Prevent further mouseup intervention
            $this.unbind("mouseup");
            return false;
        });
    }, 100);
}
$("#statustext").click(select_input);
$("#statusinput").focus(select_input);

function showControls() {
    var s = $('#statustext')[0].innerHTML; 
    if (s && s != '')
        $('#statusinput')[0].value = $('#statustext')[0].innerHTML;
    $('#statusinput')[0].style.display = 'block';
    if (s && s != '')
        $('#statusinput').height($('#statustext')[0].offsetHeight);
    $('#statustext')[0].style.display = 'none';
    $('#pleasenodisplay')[0].style.display = 'block';
    $('#KKstatusbuttons')[0].style.display = 'block';
    $('#statusinput').focus();
    $('#statusinput').select();
    select_input();
    $('#statusinput')[0].setSelectionRange(0, 40);
}

function hideControls() {
    $('#pleasenodisplay')[0].style.display = 'none';
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
        $("#setpopup").popup("open", {history:false}, {transition:'fade'});
        pressed_button = true;
        localRefresh(msg, username, 'just now');
    }
    post_params['roomkey'] = getKey();
    post_params['username'] = encodeURIComponent(username);
    if (msg && msg != '') {
        post_params['status'] = encodeURIComponent(msg);
    }else{
        console.log("WHAT. " + msg);
    }
    $.post('http://ebcmdev.appspot.com/sign', post_params, function() {});
    saveText(msg);
    //they are active -> refresh frequently
    depth = 1;
    deli = delay;
    reset_interval(deli);
}

//SLATED FOR REMOVAL?
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
    option = document.createElement("option");
    //btn.setAttribute("onclick", "pressed_button=true;setStatus('"+msg+"');");
    var split_msg = msg.split('#');
    var color = '#000000';
    if (split_msg[split_msg.length - 1].isColor()) {
        color = '#' + split_msg[split_msg.length - 1];
        option.style.color = color;
        msg = msg.substring(0, msg.lastIndexOf("#"));
    }
    //option.style.color = get_coloring(msg, option.style.color);
    console.log(msg + ' - ' + option.style.color);
    option.value = msg + color;
    option.innerHTML = msg;
    var dropdown = document.getElementById("KKstatusbuttons");
    dropdown.appendChild(option);
}

function addExtraButtons() {
    //localStorage.removeItem("statuslist");
    var statuslist = localStorage.getItem("statuslist");
    if (statuslist === null) return;
    if (statuslist == '' || statuslist == '[]') {
        //$('#KKstatusbuttons')[0].style.display = 'none';
        return;
    }
    console.log(statuslist);
    statuslist = JSON.parse(statuslist);
    var input, btn;
    var len = statuslist.length;
    for (var i=0; i < len; i++) {
        addExtraButton(statuslist[i], i);
    }
}

//whether or not a button was pressed to get out of the blur!
var pressed_button = false;

$(document).on('popupafteropen', '.ui-popup', function() {
 setTimeout(function () {
  $('#setpopup').popup('close', {transition:'fade'});
 }, 1000);
});

//set the status according to the box
function leave_custom(msg) {
    if (msg) {
        if (msg != $('#statustext')[0].innerHTML) {
            setStatus(msg); //setStatus hides the controls if good input.
        }
    }
    if (!pressed_button) {
        s = $('#statusinput').val();
        if (s != $('#statustext')[0].innerHTML) {
            setStatus(s); //setStatus hides the controls if good input.
        }
        else hideControls();
    }
}

//remembers the custom status in memory
function saveText(text) {
    console.log(text);
    text = text || document.getElementById("statusinput").value;
    console.log(text);
    if (!text.slice(-7).isColor()) {
        text += get_coloring(text);
    }
    console.log(text);
    var statuslist = localStorage.getItem("statuslist");
    if (!statuslist || statuslist == null) {
        statuslist = [text];
    } 
    else {
        statuslist = JSON.parse(statuslist);
        var i = statuslist.indexOf(text); 
        statuslist.unshift(text); //move it to the front always.
        if (i < 0) { //if the element is NOT there
            if (statuslist.length >= MAX_SAVED_STATI) {
                statuslist.pop();
            }
        } else { //if the elt is in there, move it to the front
            statuslist.splice(i+1, 1);
        }
    }
    console.log(statuslist)
    localStorage.setItem("statuslist", JSON.stringify(statuslist));
    $('#KKstatusbuttons')[0].innerHTML = '<option value="-1"> Or, select a status! </option>';
    addExtraButtons();
    //addExtraButton(text, statuslist.length - 1);
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
    var s = $('#newroomname').val()
    $('#roomname')[0].innerHTML = s;
    post_params['roomname'] = encodeURIComponent(s);
    $.mobile.changePage('#KKhome', {transition : 'flow', reverse : true});
    $.post('http://ebcmdev.appspot.com/changeroomname', post_params, function(){
    });
}

