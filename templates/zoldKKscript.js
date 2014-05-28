//clears the cookies for while we're testing
function clearCookies(debug){
    if (debug) {
      localStorage.removeItem("userkey");
    }
}

//redirects to KKhome when there is a key in localStorage
function redirectWhenCookie() {
  var key = localStorage.getItem("userkey"); 
    if(key != "" && key != null) {
      var hostname = location.hostname;
      console.log(key);
      var newplace = "?roomkey="+key+"#KKhome";
      console.log(hostname);
      console.log(newplace);
      console.log("newplace");
      window.location.assign(newplace);
    }
}

//Changes the link to KKhome using the key in localStorage
function changeLink() {
    var key = document.getElementById("roomkey").value;
    //document.getElementById("gobutton").href = "/?roomkey=" + key + "#KKhome";
    localStorage.setItem("username", document.getElementById("username").value)
    window.location.assign("/?roomkey=" + key + "#KKhome");
}

//stores username and roomname then naviages us to createroom?
//is this useful?!
function navig8() {
    localStorage.setItem("username", document.getElementById("enterfirstname").value)
    localStorage.setItem("roomname", document.getElementById("enterroomname").value)
    console.log("username is......." + document.getElementById("enterfirstname").value)
    window.location.assign("/#createroom");
}

//makes the key? I don't get this
function makeKey() {
    var str = "{{ roomkey }}"
    document.getElementById("key").innerHTML = "Key: " + str
    if (str != "" && str != "1") {
        localStorage.setItem("userkey", str);
        console.log("Just stored into local: " + localStorage.getItem("userkey"));
        console.log("Just stored into un: " + localStorage.getItem("username"));
        console.log("Just stored into rn: " + localStorage.getItem("roomname"));
    }
}

//changes the link to kkhome using the key
function changeKeyLink(){
    var rkey = "{{ roomkey }}";
    document.getElementById("toreplace").href = "/?roomkey=" + rkey + "#KKhome";
}

//displays the key from the cookie
function displayKeyToSend(){
         document.getElementById("keytosend").innerHTML = "Key: " + localStorage.getItem("userkey");
         document.getElementById("keytosendemail").innerHTML = "Key: " + localStorage.getItem("userkey");
}

//displays the key from cookie
function setUKey3() {
    document.getElementById("uniquekey3").value = localStorage.getItem("userkey");
}

//makes the status open
function setStatus(num) {
    document.getElementById("\"key" + num + "\"").value = localStorage.getItem("userkey");
    document.getElementById("\"un" + num + "\"").value = localStorage.getItem("username");
}

// //makes the status closed
// function setClosedStatus() {
//     document.getElementById("key3").value = localStorage.getItem("userkey");
//     document.getElementById("un3").value = localStorage.getItem("username");
// }

// //sets the status closed
// function setCustomKey(){
//     document.getElementById("key4").value = localStorage.getItem("userkey");
//     document.getElementById("un4").value = localStorage.getItem("username");
// }

//deletes the cookie
function deleteRoom(){
    localStorage.removeItem("userkey");
    window.location.assign("/");
}

//redirects you to KKhome
function goBack(){
    window.location.assign("#KKhome");
}
