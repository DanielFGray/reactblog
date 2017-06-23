---
title: Projects
date: false
comments: false
---

Here's a list of projects I've created.

# r-saved

As a reddit user, I've been long disappointed that a user's list of saved content has no search option, so I put together a page that grabs all your saved posts from reddit and lets you search and filter them.

* Demo: https://danielfgray.gitlab.io/r-saved
* Source: https://gitlab.com/danielfgray/r-saved

# api-helper

I often find myself making several requests to an API that requires authentication, so I put together a script that reads `cURL` options from a file and passes them as arguments to the request, allowing me to *ie* create new repos on GitLab with `api gitlab post projects -d "name=new_name"`

* Source: https://gitlab.com/danielfgray/api-helper

# boil

Often I find myself recalling specific commands from history to do specific tasks, especially when starting a new project. I created this task runner that lets you store commands or scripts in nested folders, and recursively runs it's parents scripts.

* Source: https://gitlab.com/danielfgray/boil

# fzf-scripts

I've become very fond of [fzf][fzf], a generic line filter that takes stdin and lets users filter for specific lines, so much so that I've written a dozen or so scripts for it.

[fzf]: https://github.com/junegunn/fzf

* Source: https://gitlab.com/danielfgray/fzf-scripts

# this blog

This blog was a fun project to create. I've probably tried half a dozen different static generators, and none of them quite satisfied my itch, and so I've attempted to make my own. It's still a work in progress, as you can see, but it has been fun to create my own. It uses a [custom build process][my-ssg] which converts my markdown files into json files, which is then requested by a [React][react] frontend. 

[my-ssg]: /computers/my-ssg

* Source: https://gitlab.com/danielfgray/reactblog

# factoidlist

I probably spend a bit too much time on IRC chat rooms, and there are a few channels I participate in that needed a factoid bot. A factoid bot lets you store `key:value` pairs, so that when a user in the channel says a defined key, the bot responds with the value. For example, if you tell the bot to `.learn foo = bar`, when someone in that room says "!foo" the bot responds with "bar". As soon as I had more than couple factoids stored I realized it would be much more convenient to make a web site to list them all, rather than trying to remember them.

This was my first project using React, initially I used Bootstrap for styling, and later converted it to a Material Design library.

* Demo: http://danielfgray.gitlab.io/factoidlist
* Source: https://gitlab.com/danielfgray/factoidlist
