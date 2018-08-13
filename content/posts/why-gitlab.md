---
layout: post
title: "Why GitLab"
category: computers
tags: [gitlab,github]
date: 2017/2/16
---

Occasionally people ask me why I use GitLab instead of GitHub.

# Free Private Repos

The only reason I've found to pay for GitHub's premium service is for private repos. But why pay for that when you can get it elsewhere for free?

# Open Source

I'll save the tin-foil hats and ethical arguments for another post, suffice it to say I just really prefer using software that I can hack on and third parties can audit.

# Continuous Integration

This is what really sold me. I'd had an account on GitLab before, but I hadn't really used it until I learned this.

When I first started this blog, I was using Jekyll on GitHub Pages. This was fine at first; I would make changes, commit the source, and GitHub would build it for me when I `push`ed, and deploy it to the appropriate GitHub Page. But then I wanted plugins.

This significantly changed my workflow, since GitHub only supports Jekyll in "safe-mode". I would make changes, build with Jekyll, copy the output to another folder, stash any uncommitted changes, switch to the `gh-pages` branch, wipe everything in there, copy the output back into the branch, *commit the rendered output* (of which I had no interest in tracking revisions), then push to GitHub.  
This was tedious, to say the least.

Then I learned about GitLab's CI. This let me write a simple YAML file where I would define a docker container to use, and some commands to execute. With that file in my repo, whenever I push to GitLab, it would execute those commands, and then take the output from the `public` folder and push it to my GitLab.io site. Sweet!

Put even simpler: I write my code, and GitLab builds *and* deploys it, regardless of whether I'm using Jekyll, Hexo, or if it's some custom thing I hacked together myself.

I've since set-up a couple of other projects that use this, using React+Babel+Webpack+[flavour du-jour], and I couldn't be happier.

---

The only down-sides I've experienced are that GitLab is a bit slower compared to GitHub, and doesn't have the community size that GitHub has.
