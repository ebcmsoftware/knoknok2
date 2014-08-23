//This file is for setting up the page (cuz we can't template locally)

makeKey(getKey());
if (getKey()) {
    $('#showkey')[0].innerHTML = formatKeyOutput();
    refresh();
}

default_stati = '["Come on in!#00FF00", "Asleep#FFBE00", "Studying#FFBE00", "Do not enter#FF0000"]';

//don't want to make it if !localStorage[''] because if it's an empty list it will be true and set these buttons.
if (localStorage['statuslist'] == undefined || localStorage['statuslist'] == null) {
    localStorage['statuslist'] = default_stati;
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
    if (k.length == 6 || k.length == 7)
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

var offline_elts = ['offlinething', 'offlinething0', 'offlinething1', 'offlinething2'];
var offline = false;

function toOffline() {
    offline = true;
    offline_elts.forEach(function(id) {
        $('#'+id)[0].style.display = 'block';
    });
    $('#refresher')[0].innerHTML = 'No Internet...';
}

function toOnline() {
    offline = false;
    offline_elts.forEach(function(id) {
        console.lo
        $('#'+id)[0].style.display = 'none';
    });
    $('#refresher')[0].innerHTML = 'Refresh';
    $('#makeroomtext')[0].innerHTML = 'Enter info for your Knoknok room <br>(you can change these later in settings)';
    s = $('#statusinput').val();
    if (s != $('#statustext')[0].innerHTML) {
        setStatus(s); //setStatus hides the controls if good input.
    }
}

document.addEventListener("offline", toOffline, false);
document.addEventListener("online", toOnline, false);

