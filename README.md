# Kissanime Link Grabber

Installing this script with [Tampermonkey](https://tampermonkey.net) will add this element to the right side of a show's page:

![image](https://github.com/thorio/kaGrabber/raw/master/images/grabber.png)

# Installation and Usage

1. Add the [Tampermonkey](https://tampermonkey.net) extension to your browser
2. Click [here](https://github.com/thorio/kaGrabber/raw/master/kaGrabber.user.js) to install the script
3. Open the Kissanime page you want to get links from
4. Punch in the *from* and *to* episode numbers into the widget and click *Grab Range* or click *Grab All* instead
5. Solve any captchas that come up
6. Copy the links from the alert that pops up when it's finished. The links are also logged to the console (F12)

Following the steps above you will end up with a list of openload embed links. Some download managers are able to download this already, but to be sure you can use [youtube-dl](https://github.com/rg3/youtube-dl) to get limited-time direct links.