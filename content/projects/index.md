---
title: Projects
date: false
comments: false
---

# fzf-scripts

I've become very fond of [fzf](https://github.com/junegunn/fzf), a generic line filter that takes stdin and lets users filter for specific lines, so much so that I've written half a dozen shell  scripts for it.

Source: http://gitlab.com/danielfgray/fzf-scripts

# factoidlist

I probably spend a bit too much time on IRC chat rooms, and there are a few channels I participate in that needed a factoid bot. A factoid bot lets you store key:value pairs, so that when a user in the channel says a defined key, the bot responds with the value. For example, if you tell the bot to ".learn foo = bar", when someone in that room says "!foo" the bot responds with "bar". As soon as I had more than couple factoids stored I realized it would be much more convenient to make a web site to list them all, rather than trying to remember them.

This was my first project using Facebook's React library, and initially I used Twitter Bootstrap for styling, but I later rewrote it using a Material Design library.

Demo: http://danielfgray.gitlab.io/factoidlist
Source: http://gitlab.com/danielfgray/factoidlist

# dtoplist

Speaking of IRC, one of the channels I'm on is for Linux customization, called "rice". There was an existing chat bot there that let users store links to images of their desktops. I decided that this would also be a good idea to have a web page for, and asked the owner to set-up a JSON API for me to get a list of all those links.

Demo: http://danielfgray.gitlab.io/dtoplist
Source: http://gitlab.com/danielfgray/dtoplist
