import cgi
import os
import logging
import random
import urllib
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
WELCOME_GREETING = 'Welcome to Knoknok!'


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
  def get(self):
    roomkey = self.request.get('roomkey', DEFAULT_ROOMKEY)
    username = self.request.get('username', DEFAULT_NAME)
    if roomkey != DEFAULT_ROOMKEY:
        roomkey = int(roomkey)
    logging.info("Writing to the KKHome... received roomkey " + str(roomkey))
    greetings_query = Room.query_book(ancestor_key=guestbook_key(roomkey))
    response = greetings_query.fetch(1)
    if response == []:
        if roomkey == DEFAULT_ROOMKEY:
            path = os.path.join(os.path.dirname(__file__), 'templates/index.html')
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
            path = os.path.join(os.path.dirname(__file__), 'templates/index.html')
            self.response.out.write(template.render(path, {}))
            self.redirect("/error")
            return
    room.put()
    template_values = {}
    color="#006eb7"
    if roomkey != DEFAULT_ROOMKEY:
        template_values = {
          'roomkey':room.roomkey,
          'status':room.status,
          'username':room.most_recent_username,
          'roomname':room.roomname,
          'color':color,
          'time':pretty_date(room.time),
    }
    if room.status == WELCOME_GREETING:
        template_values['username'] = 'The Knoknok Team'
    elif room.status and room.status.lower() == 'open':
        template_values['color'] = '#00ff00'
    elif room.status and room.status.lower() == 'closed':
        template_values['color'] = '#ff0000'
    path = os.path.join(os.path.dirname(__file__), 'templates/index.html')
    self.response.out.write(template.render(path, template_values))


class API(webapp.RequestHandler):
  def get(self):
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
    self.response.headers.add_header("Access-Control-Allow-Origin", "*")
    self.response.headers['Content-Type'] = 'application/json'
    self.response.out.write(
'''{"status":"%s","username":"%s","roomname":"%s","time":"%s"}'''%(room.status, room.most_recent_username, room.roomname, pretty_date(room.time))
)


class KKError(webapp.RequestHandler):
  def get(self):
    #i stole this code from charlie :)))))))))))
    self.response.out.write("""
<html>
<head>
  <!-- title & favicon -->
  <title>Knoknok: For Roommates</title>
  <link rel="icon" href="../static/favicon.ico" type="image/x-icon">
  <!-- fonts and formatting -->
  <link href='http://fonts.googleapis.com/css?family=Cabin|Telex' rel='stylesheet' type='text/css'>
  <link id= "theme" rel="stylesheet" href="themes/KKstyle2.css" />
  <!-- <link rel="stylesheet" href="themes/KKstyleBW.css" /> -->
  <link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.2/jquery.mobile.structure-1.4.2.min.css" />
  <!-- mobile specific tags here -->
  <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable = 0;" />
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <!-- scripts galore -->
  <script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
  <script src="http://code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2.min.js"></script>
  <script src= "../static/KKscript.js"></script>
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


def well_formatted(address):
    return (len(address)            >= 5 and
            len(address.split('@')) == 2 and
            len(address.split('.')) >= 2)

class SendEmail(webapp.RequestHandler):
  def post(self):
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
        if email != "" and well_formatted(email): #and email <isn't badly formatted - TODO>
            mail.send_mail(sender="The Knoknok Team <tuftswhistling@gmail.com>",
                           to=email,
                           subject="Welcome to Knoknok!",
                           body=
"""%s has invited you to join Knoknok, an app for Roommates!

To use it, download the app (iPhone: <url>, Android: <url>) and enter the key: %s, then you're all set!
""" %(sentby, roomkey))


class SendSMS(webapp.RequestHandler):
  def post(self):
    logging.info("HERE ")
    logging.info("HERE ")
    logging.info("HERE ")
    logging.info("HERE ")
    logging.info("HERE ")
    logging.info("HERE ")
    phone_number = self.request.get('sendnum').strip()
    phone_numberlist = phone_number.split(" ")
    phone_numberlist = list(set(phone_numberlist)) #remove duplicates
    def format_phone(s):
        s = s.replace('.','').replace('-','').replace('(','').replace(')','').replace(' ','')
        if len(s) == 10:
            return s
        if len(s) == 11:
            if s[0] == '1' or s[0] == '0':
                return s[1:]
        return ''
    phone_numberlist = map(format_phone, phone_numberlist)
    logging.info(phone_numberlist)
    roomkey = self.request.get('roomkey', DEFAULT_ROOMKEY)
    logging.info("received roomkey via sendSMS: <" + str(roomkey) + ">")
    account_sid = "AC51e421b3711979e266183c094ec5ebe2"
    auth_token  = "fb5fbc4048013c21dc1881fa69015fb6"
#TODO: make sure phone number is legit
    #client = TwilioRestClient(account_sid, auth_token)
    #rv = client.sms.messages.create(to="+1" + str(phone_number),
    #                                from_="+18646432174",
    #                                body="Thanks for using Knoknok! When you download the app, simply enter the key: " + str(roomkey))
    #self.response.write(str(rv)) #this was in the google example code..not sure if necessary
                                  #i seriously don't think it's necessary
    #self.redirect('/?roomkey=' + str(roomkey)+'#KKhome')


def keygen(depth=0):
  num_digits = 6 #100000 to 999999
  if depth > 50:
      class Catastrophe(Exception):
        pass
      raise Catastrophe #oh noe
  roomkey = random.randint(10 ** (num_digits-1), (10 ** num_digits) - 1)
  response = Room.query_book(ancestor_key=guestbook_key(roomkey)).fetch(1) 
  if response != []:
      if room.alive:
          logging.info("WOAH JUST HIT A COLLISION")
          logging.info("WOAH JUST HIT A COLLISION")
          logging.info("WOAH JUST HIT A COLLISION")
          logging.info("WOAH JUST HIT A COLLISION")
          logging.info("WOAH JUST HIT A COLLISION")
          logging.info("WOAH JUST HIT A COLLISION")
          logging.info(str(roomkey) + " ALREADY EXISTS")
          logging.info(str(roomkey) + " ALREADY EXISTS")
          logging.info(str(roomkey) + " ALREADY EXISTS")
          logging.info(str(roomkey) + " ALREADY EXISTS")
          logging.info(str(roomkey) + " ALREADY EXISTS")
          logging.info(str(roomkey) + " ALREADY EXISTS")
          return keygen(depth=depth+1) #rng failed, gogo retry
      else:
          return roomkey
  else:
      return roomkey


class ChangeRoomName(webapp.RequestHandler):
  def post(self):
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
    self.redirect('/?roomkey=' + str(roomkey)+ '#KKhome')


class CreateRoom(webapp.RequestHandler):
  def post(self):
    roomkey = keygen()
    greetings_query = Room.query_book(ancestor_key=guestbook_key(roomkey))
    response = greetings_query.fetch(1)
    roomname = self.request.get('enterroomname', DEFAULT_NAME)
    username = self.request.get('enterfirstname', DEFAULT_NAME)
    if response == []:
        room = Room(parent=guestbook_key(roomkey))
        room.alive = True
        room.roomkey = roomkey
        room.roomname = roomname
        room.most_recent_username = 'The Knoknok Team'
        room.status = WELCOME_GREETING
        room.time = datetime.now()
    else:
        raise KeyError #my keygen failed me... we already have a room with this roomkey
        #although this technically shouldn't happen because keygen() checks for this case but w/e
    room.put()
    template_values = {
      'status': room.status,
      'roomkey': room.roomkey,
      'username':room.most_recent_username,
      'roomname':room.roomname,
      'color':"#006eb7",
      'time':pretty_date(room.time)
    }
    path = os.path.join(os.path.dirname(__file__), 'templates/index.html')
    self.response.out.write(template.render(path, template_values))
    self.redirect('/?roomkey=' + str(roomkey)+ '#createroom')


class DeleteRoom(webapp.RequestHandler):
  def post(self):
    roomkey = self.request.get('roomkey', DEFAULT_ROOMKEY)
    if roomkey != DEFAULT_ROOMKEY:
        roomkey = int(roomkey)
    greetings_query = Room.query_book(ancestor_key=guestbook_key(roomkey))
    response = greetings_query.fetch(1)
    if response != []:
        room = response[0]
        room.alive = False
        room.put()
    self.redirect('/')


class UpdateStatus(webapp.RequestHandler):
  def post(self):
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
    room.status = self.request.get('status')
    if not update:
        room.time = datetime.now()
    room.put()
    self.redirect('/?roomkey=' + str(room.roomkey)+'#KKhome')


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
        if second_diff < 2:
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
