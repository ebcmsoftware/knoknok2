//19BFA1 is a color (for this function - it's based on looking at the output of split('#'))
//#000000 is not!
String.prototype.isColor = function() {
    return /^[0-9A-F]{6}$/i.test(this);
}

//clears the cookies for while we're testing
function clearCookies(debug){
    if (debug) {
        localStorage.removeItem("roomname");
        localStorage.removeItem("username");
        localStorage.removeItem("userkey");
    }
}

//redirects to KKhome when there is a key in localStorage
function redirectWhenCookie() {
    var key = getKey(); 
    if(key != "" && key != null && key != "undefined" && key != "None" && window.location.href.indexOf("#createroom") == -1) {
        var newplace = "?roomkey=" + key + "#KKhome";
        console.log('redirecting to ' + newplace)
        window.location.href = newplace;
    }
}

//Changes the link to KKhome using the key in localStorage
function changeLink() {
    var key = $('#roomkey0')[0].value + $('#roomkey1')[0].value;
    //document.getElementById("gobutton").href = "/?roomkey=" + key + "#KKhome";
    localStorage.setItem("username", $('#username')[0].value);
    window.location.href = "/?roomkey=" + key + "#KKhome";
}

function navig8() {
    localStorage.setItem("username", $('#enterfirstname')[0].value);
    localStorage.setItem("roomname", $('#enterroomname')[0].value);
    window.location.assign("#keyload");
    //#window.location.assign("#createroom");
    post_params = new Object();
    post_params['enterroomname'] = localStorage['roomname'];
    $.post('/createroom', post_params, function(data) {
        if (data != "" && data != "1") {
            localStorage['userkey'] = Number(data);
        }
        console.log(data);
        setTimeout(function() {
            var path = '?roomkey=' + data + '#createroom';
            window.location.href = path;
        },3500);
    });
}

function formatKeyOutput(keystr) {
    var keyoutput = "";
    for (var i = 0; i < 6; i++) {
        if (i != 0 && i % 3 === 0) {
            keyoutput += '-';
        }
        keyoutput += keystr[i];
    }
    return keyoutput
}

function makeKey(keystr) {
    var keyoutput = formatKeyOutput(keystr);
    $('#key')[0].innerHTML = "Key: " + keyoutput;
    $('#keytosendsms')[0].innerHTML = "Key: " + keyoutput;
    $('#keytosendemail')[0].innerHTML = "Key: " + keyoutput;
}

//displays the key from the cookie
function displayKeyToSend(){
    $('#keytosend')[0].innerHTML = getKey();
    //$('#keytosendemail')[0].innerHTML = getKey();
}

//displays the key from cookie
function setUKey3() {
    $('#uniquekey3')[0].value = getKey();
}

var num_phone_numbers = 1;
//adds a new phone input slot for sendsms
function addPhoneInput() {
    num_phone_numbers++;
    var i = num_phone_numbers;
    $('#phonenumbers input:last').after('<input type="tel" name="sendnum'+i+'" id="sendnum'+i+'" placeholder="Cell Number...">');
}

var numberArray = "";
function setNumberList() {
    numberArray = '';
    for (var i = 1; i < num_phone_numbers + 1; i++) {
        numberArray += $("#sendnum" + i).val();
        numberArray += " ";
    }
    //document.getElementById("numberlist").value = numberArray;
}

function sendsms() {
    setNumberList();
    var post_params = new Object();
    post_params['username'] = getUserName();
    post_params['roomkey'] = $('#uniquekey3')[0].value;
    post_params['sendnum'] = numberArray;
    $.post('/sendsms', post_params, function(){
        $.mobile.changePage('#KKhome', { transition:"pop" });
    });
}

var num_emails = 1;
//adds a new email input slot for sendemail
function addEmailInput() {
    num_emails++;
    var i = num_emails;
    $('#emailinputs input:last').after('<input type="email" name="email'+i+'" id="email'+i+'" placeholder="Email Address...">');
}

var emailArray = "";
function setEmailList() {
    document.getElementById('emailsentby').value = getUserName();
    emailArray = "";
    for (var i = 1; i < num_emails + 1; i++) {
        emailArray += $("#email" + i).val();
        emailArray += " ";
    }
//document.getElementById("emaillist").value = emailArray;
}

function sendemail() {
    setEmailList();
    var post_params = new Object();
    post_params['roomkey'] = $('#roomkeyemail')[0].value;
    post_params['emailsentby'] = $('#emailsentby')[0].value;
    post_params['emails'] = emailArray;
    $.post('/sendemail', post_params, function(){
        $.mobile.changePage('#KKhome', { transition:"pop" });
        //window.location.assign('#KKhome');
    });
}

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

var depth = 1;
var delay = 5500;

function reset_interval(dly) {
    clearInterval(interval);
    if (getKey())
        interval = setInterval(refresh_info, dly);
}

function refresh_info() {
    var req = new XMLHttpRequest;
    console.log('updating info with delay: ' + (depth/3 + 1) * delay / 1000 + 's');
    req.open('GET', '/api?roomkey='+getKey());
    req.send();
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            var info = JSON.parse(req.responseText);
            localRefresh(info['status'], info['username'], info['time'], info['roomname']);
            if (info['username'] && info['username'] != '') {
                $('#statusstats')[0].innerHTML = 'set by: ' + info['username'] + ',';
            } else {
                $('#statusstats')[0].innerHTML = 'set';
            }
            $('#statusstats')[0].innerHTML += ' ' + info['time'];
        }
    }
    //slowly make it stop spamming the server if theyre idle
    //idk maybe rething how the scaling works.
    //  10s 10s 10s 20s 20s 20s 30s 30s 30s 40s 40s 40s etc.
    if (depth++ % 3 == 0) {
        reset_interval((depth/3 + 1) * delay);
    }
}
if (getKey())
    var interval = setInterval(refresh_info, delay);
else console.log("oh");

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
    if (roomname) {
        $('#roomname')[0].innerHTML = roomname;
    }
}

//makes the status something
//msg: string to be set at the status
//update: bool, whether or not to update the time it was set at
function setStatus(msg, update) {
    //if i have time/willpower/reason to do this, make a spinner popup thing that will keep going if they don't have internet. this should work instantly though if they do have internet
    //we want this to feel immediate
    var post_params = new Object();
    var username = getUserName();
    if (update) {
        post_params['update'] = '1';
        localRefresh(msg, username);
    }
    else
        localRefresh(msg, username, 'just now');
    post_params['roomkey'] = getKey();
    post_params['username'] = username;
    post_params['status'] = msg;
    $.post('/sign', post_params, function() {});
    //they are active -> refresh frequently
    depth = 1;
    reset_interval(delay);
}

function destroyButton(i) {
    var statuslist = localStorage.getItem("statuslist");
    if (statuslist === null) return;
    statuslist = JSON.parse(statuslist);
    var currButton = $('#KKstatusbuttons')[0].firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nextSibling;
    statuslist.splice(i, 1);
    if (statuslist.length > 0) {
        localStorage.setItem("statuslist", JSON.stringify(statuslist));
    }
    else {
        localStorage.removeItem("statuslist");
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
    /*
    form = document.createElement("form");
    form.id = "newbutton" + i;
    form.method = "post";
    form.action = "/sign";
    */

    btn = document.createElement("a");
    btn.href="javascript:;";
    btn.className = "ui-btn";
    btn.setAttribute("onclick", "setStatus('"+msg+"');");
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

    //form.appendChild(btn);

    var div = document.getElementById("KKstatusbuttons");
    //div.appendChild(form);
    div.appendChild(btn);
}

function addExtraButtons() {
    var statuslist = localStorage.getItem("statuslist");
    if (statuslist === null) return;
    statuslist = JSON.parse(statuslist);
    console.log(statuslist);
    var form, input, btn;
    var len = statuslist.length;
    for (var i=0; i < len; i++) {
        addExtraButton(statuslist[i], i);
    }
}

    //remembers the custom status in memory
//  remember to make a page or some way to delete these saved messages.
function saveText() {
    savestatus = document.getElementById("status").value;
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
    document.getElementById("status").value = '';
}

//deletes the cookie
function forgetRoom(){
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
    else console.log(stats);
    window.location.assign('#KKhome');
}

function getKey() {
    return localStorage.getItem("userkey");
}

function getUserName() {
    return localStorage.getItem("username");
}

/*
function changeTheme(){
    console.log("the theme is:");
    console.log($('#theme')[0].href);
    if($('#theme')[0].href === "themes/KKstyle2.css"){
        $('#theme')[0].href = "themes/KKstyleBW.css";
        $('#themebutton').innerHTML = "Change Theme (Blue)";
    }
    else {
        $('#theme')[0].href = "themes/KKstyle2.css";
        $('#themebutton').innerHTML = "Change Theme (B & W) clicked";
    }
}
*/
function changeTheme(){
    console.log("the theme is:");
    console.log($('#theme')[0].href);
    var originalTheme = window.location.href.split("?")[0] + "themes/KKstyle2.css";
    console.log(originalTheme);
    console.log($('#themebutton')[0].text);
     if($('#theme')[0].href === originalTheme){
        $('#theme')[0].href = "themes/KKstyleBW.css";
        $('#themebutton')[0].innerHTML = "Change Theme (Blue)";
     }
     else {
         $('#theme')[0].href = "themes/KKstyle2.css";
         $('#themebutton')[0].innerHTML = "Change Theme (B & W) clickeed";
     }
}

function changeroomname() {
    var post_params = new Object();
    post_params['roomkey'] = getKey();
    post_params['roomname'] = $('#newroomname').val();
    $.post('/changeroomname', post_params, function(){
        $('#roomname')[0].innerHTML = post_params['roomname'];
        window.location.assign('#KKhome');
    });
}

function startLink(){
    window.location.assign("#get2key");
}
