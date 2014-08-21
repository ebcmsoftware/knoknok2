//This file is for setting up the page (cuz we can't template locally)

/* SLATED FOR REMOVAL - I think that refresh_info (found in Kkscript.js) does what this does.
var s = $('#statusstats')[0].innerHTML;
if (s.slice(0,9) == "set by: ,") //aka if username is nothing
$('#statusstats')[0].innerHTML = s.slice(0,3) + s.slice(9);
else console.log(s);
*/

makeKey(getKey());
if (getKey()) {
    $('#showkey')[0].innerHTML = formatKeyOutput();
    refresh();
}

//don't want to make it if !localStorage[''] because if it's an empty list it will be true and set these buttons.
if (localStorage['statuslist'] == undefined || localStorage['statuslist'] == null) {
    localStorage['statuslist'] = '["Open#00FF00", "Closed#FF0000"]';
}

addExtraButtons();

makeKey();

//enter keys for setup
//f is the function to run when enter is pressed when typing inputId
function addEnterListener(inputId, f) {
    document.getElementById(inputId).addEventListener('keydown', function(e) {
        if (!e) { var e = window.event; }
        if (e.keyCode == 13) f();
    });
}

//initializing the enterkey textboxes.
$("#roomkey0").keyup(function () {
    if($(this).val().length == 3) {
        $('#roomkey1').focus();
    }
});

//puts the key in its full form into the proper text areas and submits
function insertKey(k) {
    if (k.length >= 3)
        $("#roomkey0")[0].value = k.substring(0,3);
    if (k.length == 7)
        $("#roomkey1")[0].value = k.substring(4,7);
    else if (k.length == 6)
        $("#roomkey1")[0].value = k.substring(3,6); 
}

var pastef = function() {
    var elt = this;
    setTimeout(function() {
        var k = $(elt).val();
        insertKey(k);
    }, 10);
}
$("#roomkey0").on('paste', pastef);
$("#roomkey1").on('paste', pastef);
/* Maybe. This auto submits when they key is fully entered.
   $("#roomkey1").keyup(function () {
   console.log($(this).val().length);
   if($(this).val().length == 3) {
   changeLink();
   }
   });
 */

