//clears the cookies for while we're testing
function clearCookies(debug){
    if (debug) {
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
        if (i != 0 && i % 3 == 0) {
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
    $('#phonenumbers').append('<input type="tel" name="sendnum'+i+'" id="sendnum'+i+'" placeholder="Roommate '+i+'\'s Phone Number...">'); //there's a better thing to do than append. probably.
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

//makes the status open
function setStatus(num) {
    var key = "#" + "key" + num;
    var username = "#" + "un" + num;
    $(key)[0].value = getKey();
    $(username)[0].value = getUserName();
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

function changeTheme(){

}

function startLink(){
    window.location.assign("#get2key");
}