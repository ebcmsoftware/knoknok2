import cgi
import os
import logging
import random
import urllib
import urllib2
import json
import re
from datetime import datetime

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import ndb
from google.appengine.ext.webapp import template
from google.appengine.api import mail

#from twilio import twiml
#from twilio.rest import TwilioRestClient

DEFAULT_ROOMKEY = 1
DEFAULT_NAME = ''
WELCOME_GREETING = urllib.quote('Tap here to update the status!#FFFFFF')


class Room(ndb.Model):
  status = ndb.StringProperty()
  roomname = ndb.StringProperty()
  roomkey = ndb.IntegerProperty()
  alive = ndb.BooleanProperty(default=False)
  most_recent_username = ndb.StringProperty()
  time = ndb.DateTimeProperty()

  @classmethod
  def query_book(self, ancestor_key):
    return self.query(ancestor=ancestor_key)


def guestbook_key(roomkey=DEFAULT_ROOMKEY):
  """Constructs a Datastore key for a Guestbook entity with guestbook_name."""
  return ndb.Key('New Room', roomkey)

default_room = Room(parent=guestbook_key(DEFAULT_ROOMKEY))
default_room.roomkey = DEFAULT_ROOMKEY
default_room.put()

class MainPage(webapp.RequestHandler):
  def options(self):      
      self.response.headers['Access-Control-Allow-Origin'] = '*'
      self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
      self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE'

  def get(self):
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    path = os.path.join(os.path.dirname(__file__), '../knoknok/index.html')
    self.response.out.write(template.render(path, {}))
    return
    #self.response.out.write("/templates/index.html")
    #return
#this function actually has no more purpose (other than testing on localhost rather than file:// which is pointless. it's all API now that phonegap exists.
#SLATED FOR REMOVAL
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    roomkey = self.request.get('roomkey', DEFAULT_ROOMKEY)
    if roomkey != DEFAULT_ROOMKEY:
        roomkey = int(roomkey)
    logging.info("Writing to the KKHome... received roomkey " + str(roomkey))
    greetings_query = Room.query_book(ancestor_key=guestbook_key(roomkey))
    response = greetings_query.fetch(1)
    if response == []:
        if roomkey == DEFAULT_ROOMKEY:
            path = os.path.join(os.path.dirname(__file__), '../knoknok/index.html')
            self.response.out.write(template.render(path, {}))
            return
        room = Room(parent=guestbook_key(roomkey))
        room.roomkey = roomkey
        room.alive = False #this happened because they had information in their cache that didn't exist :|
        room.put()
        logging.info("redirecting to error")
#This should only happen in the case that a roommate deletes your room. Or we manage to fully delete their room's datastore entry.
        self.response.out.write("<script>clearCookies(true);</script>") #1 line 3 programming languages
        self.redirect("/")
        return
    else:
        room = response[0]
        logging.info(response)
        if room.roomkey != DEFAULT_ROOMKEY and not room.alive:
            logging.info("exited due to deleted room! roomkey " + str(roomkey) + " was deleted")
            path = os.path.join(os.path.dirname(__file__), '../knoknok/index.html')
            self.response.out.write(template.render(path, {}))
            self.redirect("/error")
            return
    room.put()
    template_values = {}
    if roomkey != DEFAULT_ROOMKEY:
        template_values = {
          'roomkey':room.roomkey,
          'status':room.status,
          'username':room.most_recent_username,
          'roomname':room.roomname,
          'time':pretty_date(room.time),
    }
    if room.status == WELCOME_GREETING:
        template_values['username'] = 'The Knoknok Team'
#/SLATED FOR REMOVAL
    path = os.path.join(os.path.dirname(__file__), '../knoknok/index.html')
    self.response.out.write(template.render(path, template_values))


class API(webapp.RequestHandler):
  def options(self):      
      self.response.headers['Access-Control-Allow-Origin'] = '*'
      self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
      self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE'

  def get(self):
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    roomkey = self.request.get('roomkey', DEFAULT_ROOMKEY) 
    version = urllib.unquote(self.request.get('vers', '1%2E0'))
    if roomkey != DEFAULT_ROOMKEY:
        roomkey = int(roomkey)
    greetings_query = Room.query_book(ancestor_key=guestbook_key(roomkey))
    response = greetings_query.fetch(1)
    self.response.headers['Content-Type'] = 'application/json'
    if response == []:
        logging.debug("Aw, someone entered a bad key :-(")
        self.response.out.write('null')
        return
    else:
        room = response[0]
        self.response.out.write(
        '{"status":"%s","username":"%s","roomname":"%s","time":"%s"}'%(room.status if room.status != '' else '.', 
                                                                       room.most_recent_username, 
                                                                       room.roomname, 
                                                                       pretty_date(room.time)))


class KKError(webapp.RequestHandler):
  def options(self):      
      self.response.headers['Access-Control-Allow-Origin'] = '*'
      self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
      self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE'
  def get(self):
    #i stole this code from charlie :)))))))))))
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    self.response.out.write("""
<html>
<head>
  <!-- title & favicon -->
  <title>Knoknok: For Roommates</title>
  <link rel="icon" href="static/images/favicon.ico" type="image/x-icon">
  <!-- fonts and formatting -->
  <!-- <link href='stylesheets/Cabin_Telex.css' rel='stylesheet' type='text/css'> -->
  <link href='http://fonts.googleapis.com/css?family=Raleway:600' rel='stylesheet' type='text/css'>
  <link id="theme" rel="stylesheet" href="templates/themes/KKstyle2.css"/>
  <link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile.structure-1.4.2.min.css" />
  <!-- mobile specific tags here -->
  <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable = 0;" />
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <!-- scripts galore -->
  <script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
  <script src="http://code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2.min.js"></script>
  <script src= "static/KKscript.js"></script>
  <script src= "static/fastbutton.js"></script>
  <script src= "static/jQFastButtons.js"></script>
</head>


<div data-role = "page" data-theme = "a" data-dialog = "true" id= "error">
<div data-role = "main" class = "ui-content">
  <div class="ui-field-contain">
    <p>This room doesn't exist :(</p>
    <a href='/' onclick="clearCookies(true);" class='ui-btn'>Go back to home page</a>
  </div>
</div>
</div>
</html>
    """)


def well_formatted_email(address):
    return (len(address)            >= 5 and
            len(address.split('@')) == 2 and
            len(address.split('.')) >= 2)

class SendEmail(webapp.RequestHandler):
  def options(self):      
      self.response.headers['Access-Control-Allow-Origin'] = '*'
      self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
      self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE'

  def post(self):
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    emails = self.request.get('emails').strip()
    sentby = self.request.get('emailsentby').strip()
    if not sentby or sentby == '':
        sentby = 'Your roommate'
    logging.info("email sent by " + sentby)
    emaillist = emails.split(" ")
    emaillist = list(set(emaillist)) #remove duplicates
    logging.info(emaillist)
    roomkey = self.request.get('roomkey', DEFAULT_ROOMKEY)
    logging.info("received roomkey via sendEmail: <" + str(roomkey) + ">")
    for email in emaillist:
        if email != "" and well_formatted_email(email):
            mail.send_mail(sender="The Knoknok Team <tuftswhistling@gmail.com>",
                           to=email,
                           subject="Your friend invited you to Knoknok!",
                           body=
"""%s has invited you to join Knoknok, an app for Roommates!

To use it, download the app (iPhone: <url>, Android: <url>) and enter the key: %s, then you're all set!

Happy Knoknoking!
The Knoknok Team
""" %(sentby, roomkey))


def well_formatted_number(number):
    l = len(number)
    return (l == 10 or 
            l == 11 and number[0] == 1)

def formatKeyOutput(keystr):
    keyoutput = ''
    for i in range(len(keystr)):
        if i != 0 and i % 3 == 0:
            keyoutput += '-'
        keyoutput += keystr[i]
    return keyoutput

class SendSMS(webapp.RequestHandler):
  def post(self):
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    phone_number = (self.request.get('sendnum').strip())
    phone_numberlist = phone_number.split(' ')
    phone_numberlist = list(set(phone_numberlist)) #remove duplicates
    def format_phone(s):
        try:
          int(s)
        except ValueError:
          return ''
        s = s.replace('.','').replace('-','').replace('(','').replace(')','').replace('+','').replace('[','').replace(']','').replace(' ','').replace('{','').replace('}','')
        if len(s) == 10:
            return s
        if len(s) == 11:
            if s[0] == '1' or s[0] == '0':
                return s[1:]
        return ''
    try:
        roomkey = int(self.request.get('roomkey', DEFAULT_ROOMKEY))
    except ValueError:
        return #I can't imagine a scenario in which this would happen.
    username = (self.request.get('username', DEFAULT_ROOMKEY))
    phone_numberlist = map(format_phone, phone_numberlist)
    logging.info(phone_numberlist)
    account_sid = "AC51e421b3711979e266183c094ec5ebe2"
    auth_token  = "fb5fbc4048013c21dc1881fa69015fb6"
    client = None #XXX XXX XXX XXX XXX XXX  
    #client = TwilioRestClient(account_sid, auth_token)
    if username and username != '':
        body = username
    else:
        body = 'Your roommate'
    def getShortURL(body, roomkey):
        longUrl = urllib.quote("http://getknoknok.appspot.com/dl?r=" + str(roomkey) + "&u=" + urllib.quote(body))
        domain = 'j.mp'
        s = "https://api-ssl.bitly.com/v3/shorten?access_token=ec777330de81e373955aeb4597352f4e55766f42&longUrl="+longUrl+"&domain=" + domain
        data = json.load(urllib2.urlopen(s))
        return 'http://' + domain + '/' + data['global_hash']
    body += " invited you to join Knoknok! It's free! Get started here: " + getShortURL(body, roomkey)
    for phone_number in phone_numberlist:
        if phone_number != '':
            rv = client.sms.messages.create(to="+1" + str(phone_number),
                                    from_="+18646432174",
                                    body=body)
    self.response.write(str(rv))
    #self.redirect('/?roomkey=' + str(roomkey)+'#KKhome') #SLATED FOR REMOVAL


def keygen(depth=0):
  num_digits = 6 #100000 to 999999
  if depth > 50:
      mail.send_mail(sender="Knoknok CATASTROPHE <tuftswhistling@gmail.com>",
                       to="popcorncolonel@gmail.com",
                       subject="OH NO.",
                       body="OH MY GOD YOU RAN OUT OF KEYS")

      class Catastrophe(Exception):
          pass
      raise Catastrophe #oh noe :(
  roomkey = random.randint(10 ** (num_digits-1), (10 ** num_digits) - 1)
  response = Room.query_book(ancestor_key=guestbook_key(roomkey)).fetch(1) 
  if response != []:
      room = response[0]
      if room.alive:
          logging.debug("WOAH JUST HIT A COLLISION")
          logging.debug(str(roomkey) + " ALREADY EXISTS")
          return keygen(depth=depth+1) #rng failed, gogo retry
      else:
          logging.debug("HIT COLLISION ("+str(roomkey)+") BUT RESOLVED IT!!!")
          logging.debug("HIT COLLISION ("+str(roomkey)+") BUT RESOLVED IT!!!")
          logging.debug("HIT COLLISION ("+str(roomkey)+") BUT RESOLVED IT!!!")
          logging.debug("HIT COLLISION ("+str(roomkey)+") BUT RESOLVED IT!!!")
          logging.debug("HIT COLLISION ("+str(roomkey)+") BUT RESOLVED IT!!!")
          logging.debug("HIT COLLISION ("+str(roomkey)+") BUT RESOLVED IT!!!")
          return roomkey
  else:
      return roomkey


class CreateRoom(webapp.RequestHandler):
  def options(self):      
      self.response.headers['Access-Control-Allow-Origin'] = '*'
      self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
      self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE'
    
  def post(self):
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    roomkey = keygen()
    greetings_query = Room.query_book(ancestor_key=guestbook_key(roomkey))
    response = greetings_query.fetch(1)
    roomname = self.request.get('enterroomname', DEFAULT_NAME)
    if response == []:
        room = Room(parent=guestbook_key(roomkey))
    else:
        room = response[0]
    room.alive = True
    room.roomkey = roomkey
    room.roomname = roomname
    room.most_recent_username = 'The Knoknok Team'
    room.status = WELCOME_GREETING
    room.time = datetime.now()
    room.put()
    template_values = {
      'status': room.status,
      'roomkey': room.roomkey,
      'username':room.most_recent_username,
      'roomname':room.roomname,
      'time':'just now'
    }
    path = os.path.join(os.path.dirname(__file__), '../knoknok/index.html')
    self.response.out.write(str(room.roomkey))
    #self.response.out.write(template.render(path, template_values))
    #self.redirect('/?roomkey=' + str(roomkey)+ '#createroom')


class ChangeRoomName(webapp.RequestHandler):
  def post(self):
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    roomkey = self.request.get('roomkey', DEFAULT_ROOMKEY)
    if roomkey != DEFAULT_ROOMKEY:
        roomkey = int(roomkey)
    roomname = self.request.get('roomname', DEFAULT_NAME)
    greetings_query = Room.query_book(ancestor_key=guestbook_key(roomkey))
    response = greetings_query.fetch(1)
    if response != []:
        room = response[0]
        room.roomname = roomname
    else: 
        logging.info(str(response) + "__" + roomkey + "__")
        raise KeyError #key not found - exit
    room.put()
    #self.redirect('/?roomkey=' + str(roomkey)+ '#KKhome')


class DeleteRoom(webapp.RequestHandler):
  def options(self):      
      self.response.headers['Access-Control-Allow-Origin'] = '*'
      self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
      self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE'
    
  def post(self):
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    roomkey = self.request.get('roomkey', DEFAULT_ROOMKEY)
    if roomkey != DEFAULT_ROOMKEY:
        roomkey = int(roomkey)
    greetings_query = Room.query_book(ancestor_key=guestbook_key(roomkey))
    response = greetings_query.fetch(1)
    if response != []:
        room = response[0]
        room.alive = False
        room.put()
    #self.redirect('/')


class UpdateStatus(webapp.RequestHandler):
  def options(self):      
      self.response.headers['Access-Control-Allow-Origin'] = '*'
      self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
      self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE'
    
  def post(self):
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    #boolean - whether or not we are just updating the info and not making a new status 
    update = self.request.get('update', DEFAULT_ROOMKEY) 
    update = update == '1' #booleanize it
    roomkey = self.request.get('roomkey', DEFAULT_ROOMKEY) 
    if roomkey != DEFAULT_ROOMKEY:
        roomkey = int(roomkey)
    logging.info("got roomkey in /sign " + str(roomkey))
    greetings_query = Room.query_book(ancestor_key=guestbook_key(roomkey))
    response = greetings_query.fetch(1)
    if response == []:
        logging.info("wait waht")
        room = Room(parent=guestbook_key(roomkey))
        room.alive = True
    else:
        room = response[0]
    room.most_recent_username = self.request.get('username')
    s = self.request.get('status')
    if s and s != '':
        room.status = s
    if not update:
        room.time = datetime.now()
    room.put()
    #self.redirect('/?roomkey=' + str(room.roomkey)+'#KKhome')


def pretty_date(time=False):
    """
    Get a datetime object or a int() Epoch timestamp and return a
    pretty string like 'an hour ago', 'Yesterday', '3 months ago',
    'just now', etc
    """
    now = datetime.now()
    if type(time) is int:
        diff = now - datetime.fromtimestamp(time)
    elif isinstance(time,datetime):
        diff = now - time 
    elif not time:
        diff = now - now
    second_diff = diff.seconds
    day_diff = diff.days

    if day_diff < 0:
        return ''
    if day_diff == 0:
        if second_diff < 5:
            return "just now"
        if second_diff < 60:
            return str(second_diff) + " seconds ago"
        if second_diff < 120:
            return  "a minute ago"
        if second_diff < 3600:
            return str( second_diff / 60 ) + " minutes ago"
        if second_diff < 7200:
            return "an hour ago"
        if second_diff < 86400:
            return str( second_diff / 3600 ) + " hours ago"
    if day_diff == 1:
        return "yesterday"
    if day_diff < 7:
        return str(day_diff) + " days ago"
    if day_diff < 31:
        return str(day_diff/7) + " weeks ago"
    if day_diff < 365:
        return str(day_diff/30) + " months ago"
    return str(day_diff/365) + " years ago"

application = webapp.WSGIApplication([('/', MainPage),
                                      ('/error', KKError),
                                      ('/sendsms', SendSMS),
                                      ('/sendemail', SendEmail),
                                      ('/api', API),
                                      ('/changeroomname', ChangeRoomName),
                                      ('/createroom', CreateRoom),
                                      ('/deleteroom', DeleteRoom),
                                      ('/sign', UpdateStatus)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()
