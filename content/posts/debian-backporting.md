---
layout: post
title: "Backporting packages in Debian"
category: computers
tags: [debian,linux]
date: 2013/10/22
---

Are you anxious for a new version of a particular package, and don't want to wait for someone else to submit it to backports?
After a few hours of reading docs and testing this out myself I feel like I've gotten a good grasp on this, so I'd like to share what's been working for me.

Debian doesn't have the source for packages automatically available on new installs, so to download the sources for packages, you want at least one or more of the following lines in `/etc/apt/sources.list`:

```
deb-src http://http.debian.net/debian stable main
deb-src http://http.debian.net/debian testing main
deb-src http://http.debian.net/debian unstable main
deb-src http://http.debian.net/debian experimental main
```

I think it's best to add all of them. If you have `xclip` installed you can copy those to your clipboard and run `xclip -o | sudo tee -a /etc/apt/sources.list`. After adding those, you have to tell `apt` to update it's cache with `apt-get update`.

Now that Debian has the source available, you can tell it to download the dependencies for the program you want to build with `apt-get build-dep <package>`

If you don't have a build directory, I'd suggest making one and changing to it: `mkdir ~/build && cd ~/build`

Now, to download the source with apt you first have to know the Debian version number, which you can do with `apt-cache showsrc <package> | less`. You can type `/Version` to find the lines with the version numbers, or if you're feeling particularly fancy you can use `awk` to extract just the version numbers: `apt-cache showsrc <package> | awk '/^Version/ {print $2}'`

Now that you have a specific version number, you can download the source and automatically begin compiling with with `apt-get source -b <package>=<version>`. This will download the tarballs of the source for the particular version with any patches the Debian maintainers have added in the current working directory, extract the archives and then begin compiling. When it's done there should be a `.deb` file for you to install with `sudo dpkg -i <filename>`

If you want to `./configure` the package with your own flags, the process is a bit trickier. To not automatically start compiling, omit the `-b` flag from `apt-get source`. Once you have the source files, `cd` into the folder, and then look for a file in the `debian` directory called `rules`, this file should have the `./configure` switches in there. Once you're happy with the changes use `dpkg-buildpackage -uc -us` to build it. When it's done the `.deb` file will be in the parent directory.

And there you have it!

The tl;dr version of this (once your have source packages added to your repos) is to:

``` bash
apt-cache showsrc <package>
sudo apt-get build-dep <package>
apt-get source -b <package>=<version>
sudo dpkg -i <package>.deb
```

It should be noted that this is not fool-proof, some packages will fail to build for various reasons, most often the build dependencies might require newer versions than are available from the repos, in which case you have to start down another path of backporting the dependencies, which can sometimes lead to backporting dependencies of dependencies..

I wrote a script to try and automate this process:
https://github.com/DanielFGray/bin/raw/master/debbackport
