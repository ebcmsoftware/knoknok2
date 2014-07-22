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
    if(key != "" && key != null && key != "undefined" && key != "None") {
        var hostname = location.hostname;
        console.log(key);
        var newplace = "?roomkey=" + key + "#KKhome";
        console.log(hostname);
        console.log(newplace);
        console.log("newplace");
        window.location.assign(newplace);
    }
}

//Changes the link to KKhome using the key in localStorage
function changeLink() {
    var key = $('#roomkey')[0].value;
    //document.getElementById("gobutton").href = "/?roomkey=" + key + "#KKhome";
    localStorage.setItem("username", $('#username')[0].value);
    window.location.assign("/?roomkey=" + key + "#KKhome");
}

//stores username and roomname then naviages us to createroom?
//is this useful?!
function navig8() {
    localStorage.setItem("username", $('#enterfirstname')[0].value);
    localStorage.setItem("roomname", $('#enterroomname')[0].value);
    console.log("username is......." + $('#enterfirstname')[0].value);
    window.location.assign("/#createroom");
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

//makes the key? I don't get this
function makeKey(keystr) {
    var keyoutput = formatKeyOutput(keystr);
    $('#key')[0].innerHTML = "Key: " + keyoutput;
    if (keystr != "" && keystr != "1") {
        localStorage.setItem("userkey", keystr);
    }
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
    $('#phonenumbers input:last').after('<input type="tel" name="sendnum'+i+'" id="sendnum'+i+'" placeholder="Roommate '+i+'\'s Phone Number...">');
    console.log(document.getElementById('phonenumbers').innerHTML)
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
    post_params['roomkey'] = $('#uniquekey3')[0].value;
    post_params['sendnum'] = numberArray;
    $.post('/sendsms', post_params, function(){window.location.assign('#KKhome');});
}

var num_emails = 1;
//adds a new email input slot for sendemail
function addEmailInput() {
    num_emails++;
    var i = num_emails;
    $('#emailinputs input:last').after('<input type="email" name="email'+i+'" id="email'+i+'" placeholder="Roommate '+i+'\'s Email Address...">');
    console.log(document.getElementById('emailinputs').innerHTML);
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
    $.post('/sendemail', post_params, function(){window.location.assign('#KKhome');});
}

function setColor(msg) {
    if (msg == 'Open') {
        $('#statusbar')[0].style.borderColor = '#00FF00';
        $('#statusbar')[0].style.color = '#00FF00';
    }
    else if (msg == 'Closed') {
        $('#statusbar')[0].style.borderColor = '#FF0000';
        $('#statusbar')[0].style.color = '#FF0000';
    }
    else {
        $('#statusbar')[0].style.borderColor = '#006eb7';
        $('#statusbar')[0].style.color = '#006eb7';
    }
}

var depth = 1;
var delay = 10000;
function refresh_info() {
    var req = new XMLHttpRequest;
    console.log('updating info');
    req.open('GET', '/api?roomkey='+getKey());
    req.send();
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            var info = JSON.parse(req.responseText);
            if (info['status'] != $('#statustext')[0].innerHTML) {
                $('#statustext')[0].innerHTML = info['status'];
                setColor(info['status']);
            }
            if (info['roomname'] != $('#roomname')[0].innerHTML) {
                $('#roomname')[0].innerHTML = info['roomname'];
            }
            if (info['username'] && info['username'] != '') {
                $('#statusstats')[0].innerHTML = 'set by: ' + info['username'] + ',';
            } else {
                $('#statusstats')[0].innerHTML = 'set';
            }
            $('#statusstats')[0].innerHTML += ' ' + info['time'];
        }
    }
    //slowly make it stop spamming the server if theyre idle
    if (depth++ % 3 == 0) {
        clearInterval(interval);
        interval = setInterval(refresh_info, (depth / 3 + 1) * delay);
    }
}
var interval = setInterval(refresh_info, delay);

//makes the status something
//msg: string to be set at the status
//update: bool, whether or not to update the time it was set at
function setStatus(msg, update) {
    //if i have time to do this, make a spinner popup thing that will keep going if they don't have internet. this should work instantly though if they do have internet
    var post_params = new Object();
    var username = getUserName();
    if (update) {
        post_params['update'] = '1';
    }
    post_params['roomkey'] = getKey();
    post_params['username'] = username;
    post_params['status'] = msg;
    //we want this to feel immediate
    $('#statustext')[0].innerHTML = msg;
    if (username && username != '')
        $('#statusstats')[0].innerHTML = 'set by: ' + username;
    else 
        $('#statusstats')[0].innerHTML = 'set by you';
    if (!update) {
        $('#statusstats')[0].innerHTML += ', just now';
    }
    setColor(msg);
    $.post('/sign', post_params, function() {});
    //they are active
    depth = 1;
    clearInterval(interval);
    interval = setInterval(refresh_info, delay);
}

function destroyButton(i) {
    var statuslist = localStorage.getItem("statuslist");
    if (statuslist === null) return;
    statuslist = JSON.parse(statuslist);
    statuslist.splice(i, 1);
    console.log(statuslist);
    if (statuslist.length > 0) {
        localStorage.setItem("statuslist", JSON.stringify(statuslist));
    }
    else {
        localStorage.removeItem("statuslist");
    }
    //TODO: CHANGE THIS to just remove the element and not refresh
    var btn = document.getElementById('newbutton'+i)
    btn.parentNode.removeChild(btn);
}

function addExtraButton(msg, i) {
    form = document.createElement("form");
    form.id = "newbutton" + i;
    form.method = "post";
    form.action = "/sign";

    btn = document.createElement("a");
    btn.href="javascript:;";
    btn.className = "ui-btn";
    btn.setAttribute("onclick", "setStatus('"+msg+"');");
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

    form.appendChild(btn);

    var div = document.getElementById("KKstatusbuttons");
    div.appendChild(form);
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
        console.log(statuslist); 
        statuslist = JSON.parse(statuslist);
        statuslist.push(savestatus);
    }
    console.log(statuslist);
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
    console.log(stats.split(',')[0]);
    console.log(oldname == '');
    window.location.assign('#KKhome');
}

function getKey() {
    return localStorage.getItem("userkey");
}

function getUserName(){
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
