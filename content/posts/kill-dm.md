---
layout: post
title: "Killing the Display Manager"
category: computers
tags: [linux, fzf]
date: 2016/09/29
---

Display managers like LightDM and SDDM come standard with many Linux distros, and I personally find them useless. I'd like to share with you how to get rid of them and gain a bit of control over how X is launched, and take back a few precious megabytes of RAM.

# Writing an xinitrc

Display managers are usually a fancy graphical wrapper around a few basic commands, namely `startx` which is actually a wrapper around `xinit`. I won't get into too many of the details (I'm not even sure of many of them, there's historical reasoning that made sense long ago), but suffice it to say, all you need to replace a display manager is the `xinit` package and an `~/.xinitrc` script.

My `xinitrc` is a bit complex, but here it is:

``` bash
#!/usr/bin/env bash

# arguments passed to startx start at $2 for some reason..
# if nothing is passed, default to xterm
declare wm="${2:-xterm}"

# small helper function
is_running() {
  pgrep -x "$1" &> /dev/null
}
 
# this will run immediately
xrdb -load ~/.Xresources

while sleep 0.3; do
  if is_running "$wm"; then
    # things inside this will run after your wm has launched
    xmodmap ~/.xmodmap
    # firefox & # example
    break
  fi
done &
 
# Arch Linux users need the following
if [[ -d /etc/X11/xinit/xinitrc.d ]]; then
  for f in /etc/X11/xinit/xinitrc.d/*; do
    [[ -x "$f" ]] && source "$f"
  done
fi
 
exec "$wm"
```

With this script, running `startx` will launch xterm, and you can use xterm to run any window manager you want, and switch window managers without actually restarting the X session. You can also pass arguments to `startx`: for example, if you wanted to start XFCE you would use `startx startxfce4` or if you wanted to launch Openbox: `startx openbox-session`.

It's important to note that the last line of the script *must* be `exec <what you want to launch X with>`, and that anything before it will block until it's finished, potentially leaving the script running indefinitely. If you wanted to launch another program automatically (for example [redshift](http://jonls.dk/redshift/)), make sure it goes inside the `while...if` loop, and that it has an `&` after it (like the Firefox example) so that it runs in the background. In the above example I didn't add an `&` to the end of the `xrdb` or `xmodmap` commands since they usually finish running in milliseconds, and forking them to the background would be an unnecessary subshell. Basically any long-running processes, or commands that take a non-trivial amount of time to run, should be forked to the background with `&`.

---

Now that you have an xinitrc script, you can disable your display manager. I can't tell you exactly how to do that since it varies from distro to distro, but if you're using systemd and LightDM you would want to run `sudo systemctl disable lightdm` to disable it from running on boot, and `sudo systemctl stop lightdm` to stop it running right now. Be warned that the latter will also kill your current X session, so you might want to bookmark this page before you do that.

# Starting X automatically on login

Running `startx` after login every time is pretty annoying though. Wouldn't it be nice if we could automatically run `startx` when we login?

``` bash
if [[ -z "$DISPLAY" && "$TTY" = '/dev/tty1' ]]; then
  exec startx startxfce4
fi
```

This little blurb will do just that! It checks to see if there is no existing X server running, and the login occurred on `tty1`, which is usually the default. If these conditions are met, it runs `startx startxfce4` for you. You'll want to change the `startxfce4` part depending on which window manager or desktop environment you use.

If you use bash you'll want to save this as `~/.bash_login`, or if you use zsh you'll want to save it as `~/.zlogin`. If you're unsure, it's likely bash (if you use fish you're on your own here). If you want a solution that's a bit more independent of the shell, you can save it as `~/.login` but you'll still have to tell your shell to `source` it either by symlinking to it or by putting `source ~/.login` in the appropriate file.

# Getting fancy with fzf

If you have a few window managers or desktop environments installed, you'll probably want to be able change between them without editing a script. I hacked together a solution that uses Junegunn's [fzf](https://github.com/junegunn/fzf) to list and choose those that are available. If `fzf` isn't installed or available for some reason it falls back to bash's built in `select` feature. You'll want to change your `bash_login` or `zlogin` script to something like this:

``` bash
if [[ -z "$DISPLAY" && "$TTY" = '/dev/tty1' ]]; then
  exec startx "$(wmpicker)"
fi
```

Then, in a new file, save this somewhere in your user's `$PATH` (ideally `~/.bin` or `~/.local/bin`) and `chmod +x` to make it executable. If you don't have a local-user bin directory I'd strongly suggest making one (the details are a bit out of the scope of this article, you'll have to consult your shell's docs), but if you're lazy you could save it in `/usr/local/bin`, just don't forget to `chmod +x`.

``` bash
#!/usr/bin/env bash

declare -a known_wms
declare -a avail_wms

known_wms=( awesome openbox-session bspwm xmonad dwm startkde startxfce4 xterm )
avail_wms=()
for wm in "${known_wms[@]}"; do
  command -v "$1" &> /dev/null "$wm" && avail_wms+=( "$wm" )
done

if has fzf; then
  fzf --reverse --inline-info --cycle < <(printf '%s\n' "${avail_wms[@]}")
else
  PS3="choose a number between 1 and ${#avail_wms[@]}: "
  select wm in "${avail_wms[@]}"; do
    echo "$wm"
    break
  done
fi
```
 
This has a hard-coded list, so if yours isn't in there you'll want to add it to the list of `known_wms`.

If you prefer [fzy](https://github.com/jhawthorn/fzy) or [selecta](https://github.com/garybernhardt/selecta) or even just plain `dialog` you could change it to use that, but I'll leave that as a exercise for the reader :)

# systemd auto-login 

Some display manager's include a feature to automatically log you in, but you can do that without a display manager on systemd.

`sudo systemctl edit getty@tty1` will open a file with your `$EDITOR`, you'll want to change it so it looks something like this:

```
[Service]
ExecStart=-/usr/bin/agetty --autologin <YOUR USERNAME HERE> --noclear %I $TERM
```

This is shameless [stolen from Arch Wiki](https://wiki.archlinux.org/index.php/Getty#Virtual_console)
