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
    $('#phonenumbers input:last').after('<input type="tel" name="sendnum'+i+'" id="sendnum'+i+'" placeholder="Roommate '+i+'\'s Phone Number...">'); //there's a better thing to do than this. probably. charlie knows how to do it.
    console.log(document.getElementById('phonenumbers').innerHTML)
}

function setNumberList() {
    var numberArray = "";
    for (var i = 1; i < num_phone_numbers + 1; i++) {
        numberArray += $("#sendnum" + i).val();
        numberArray += " ";
    }
    document.getElementById("numberlist").value = numberArray;
}

var num_emails = 1;
//adds a new phone input slot for sendsms
function addEmailInput() {
    num_emails++;
    var i = num_emails;
    $('#emailinputs input:last').after('<input type="text" name="email'+i+'" id="email'+i+'" placeholder="Roommate '+i+'\'s Email Address...">'); //there's a better thing to do than this. probably. charlie knows how to do it.
    console.log(document.getElementById('emailinputs').innerHTML)
}

function setEmailList() {
    document.getElementById('emailsentby').value = getUserName();
    var emailArray = "";
    for (var i = 1; i < num_emails + 1; i++) {
        emailArray += $("#email" + i).val();
        emailArray += " ";
    }
    document.getElementById("emaillist").value = emailArray;
}

//makes the status something
function setStatus(num) {
    var key = "#" + "key" + num;
    var username = "#" + "un" + num;
    $(key)[0].value = getKey();
    $(username)[0].value = getUserName();
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
}

function addExtraButtons() {
    var statuslist = localStorage.getItem("statuslist");
    if (statuslist === null) return;
    statuslist = JSON.parse(statuslist);
    console.log(statuslist);
    var form, input, btn;
    var len = statuslist.length;
    for (var i=0; i < len; i++) {
        form = document.createElement("form");
        form.method = "post";
        form.action = "/sign";

        input = document.createElement("input");
        input.type = "hidden";
        input.name = "status";
        input.value = statuslist[i];
        form.appendChild(input);

        input = document.createElement("input");
        input.type = "hidden";
        input.name = "roomkey";
        input.value = getKey();
        form.appendChild(input);

        input = document.createElement("input");
        input.type = "hidden";
        input.name = "username";
        input.value = getUserName();
        form.appendChild(input);

        btn = document.createElement("a");
        btn.href="javascript:;";
        btn.className = "ui-btn";
        //btn.setAttribute("onclick", "parentNode.submit();");
        btn.innerHTML = statuslist[i];

        close = document.createElement("span");
        close.addEventListener('click', function(element){
          //this.parentNode
          this.parentNode.removeAttribute('onclick');
        });
        close.setAttribute("onclick", "destroyButton("+i+");window.location.reload();");
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
}

    //remembers the custom status in memory
//  remember to make a page or some way to delete these saved messages.
function saveText() {
    savestatus = document.getElementById("status").value;
    var statuslist = localStorage.getItem("statuslist");
    if (!statuslist || statuslist === null) {
        statuslist = [savestatus];
    } 
    else {
        console.log(statuslist); 
        statuslist = JSON.parse(statuslist);
        statuslist.push(savestatus);
    }
    console.log(statuslist);
    localStorage.setItem("statuslist", JSON.stringify(statuslist));
    addExtraButtons();
}

//deletes the cookie
function forgetRoom(){
    localStorage.removeItem("userkey");
}

function changeUserName() {
    var username = document.getElementById('usernameinput').value; 
    var key = localStorage.setItem('username', username);
    //maybe have it update the previously updated status? it still shows the older status
    window.location.assign('?roomkey='+getKey()+'#KKhome');
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


function startLink(){
    window.location.assign("#get2key");
}
