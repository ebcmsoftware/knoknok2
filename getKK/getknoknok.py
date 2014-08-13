import os
import logging

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template

class MainPage(webapp.RequestHandler):
  def options(self):      
      self.response.headers['Access-Control-Allow-Origin'] = '*'
      self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
      self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE'

  def get(self):
      path = os.path.join(os.path.dirname(__file__), 'index.html')
      self.response.out.write("GOTTA GET GIT. GOT IT?" + path)



def formatKeyOutput(keystr):
    keyoutput = ''
    for i in range(len(keystr)):
        if i != 0 and i % 3 == 0:
            keyoutput += '-'
        keyoutput += keystr[i]
    return keyoutput


class Download(webapp.RequestHandler):
  def options(self):      
      self.response.headers['Access-Control-Allow-Origin'] = '*'
      self.response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
      self.response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE'

  def get(self):
      path = os.path.join(os.path.dirname(__file__), 'download.html')
      params = {}
      try:
          params['roomkey'] = formatKeyOutput(self.request.get('r', ''))
      except ValueError:
          logging.error("This should not happen.")
          params['roomkey'] = ''
#TODO: "download knoknok here: <sites>"
          self.response.out.write("An error occurred :-( lol sry but u can dl knoknok here: www.ios.com www.android.com")
          return
      params['username']= self.request.get('u', 'your roommate')
      self.response.out.write(template.render(path, params))
      


application = webapp.WSGIApplication([('/', MainPage),
                                      ('/dl', Download)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

