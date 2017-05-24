---
layout: post
title: "Fuzzy searching for MPD in Bash"
category: computers
tags: [programming, linux, bash, mpd, fzf]
date: 2014/11/02
---

I recently came across [fzf](https://github.com/junegunn/fzf), which is an interactive line filter. By default `fzf` will fuzzy search recursively through file names in the current directory, but it also filters through stdin.

Realizing it was a generic filter, and not just for files, I wondered what else I could fuzzy search through, and, being a musician, I felt that filtering through my music library would be handy.

`mpc` is a CLI interface to mpd, and after reading through the [man page](http://man.cx/mpc(1)), I find that `mpc listall` will display a list of every song in the mpd database (although later on I learned it's actually bad practice). So immediately I ran `mpc listall | fzf`, which worked as I expected. Only, `fzf` just prints the selection to stdout, it doesn't have any side-effects besides printing to stdout. So after reading the man page some more and tinkering around, I learn that `mpc add` will take files from stdin and add them to the bottom of the playlist.

So `mpc listall | fzf | mpc add` will list all available files in the mpd database, fuzzy filter through them, then add to the bottom of the playlist. Unfortunately, that still doesn't actually play the added song, and `mpc play` will only play whatever song is currently selected in the queue, rather than the new song. In the end I found that `mpc play` accepts an integer as an index from the playlist. So, if `mpc add` puts them at the bottom, I need to know how many songs are in the playlist, which I can achieve with `mpc playlist | wc -l` (`wc` is wordcount, the `-l` switch counts lines). At this point my code is better suited to a script rather than a one-liner like:

``` bash
mpc listall | fzf | mpc add && mpc play $(mpc playlist | wc -l)
```

Which has some weird quirks if I don't actually add a song. And what if I want to add multiple songs? `fzf` has the `-m` switch to select multiple lines, and `mpc add` happily adds as many songs as it's given.

After talking to #bash on freenode they pointed out I would be better off using an array for multiple files, and `mapfile` is perfect for this. The biggest benefit to using an array here is that I have built-in functionality for counting the elements, rather than repeatedly calling `wc -l`.

`mapfile -t songs < <(mpc listall | fzf -m)` will create a variable called `songs` as an array with all the lines as individual elements. I'm also using process substitution here because [mapfile](http://wiki.bash-hackers.org/commands/builtin/mapfile) expects stdin, but the input is a command, so I use the `<()` penguin-looking syntax to trick mapfile into thinking the command is really a file . Bash's quirky [array syntax](http://wiki.bash-hackers.org/syntax/arrays) provides `${songs[@]}` as a reference to all items in the array, and `$(#songs[@])` to count the amount of items in the `$songs` array. With this information I have all the pieces to make a fuzzy music finder.

Using the array, I want to pass each element as a string separated by a newline to `mpc add`. This can be done with a little `printf` magic: `printf '%s\n' "${songs[@]}"`. If I assign a variable to the length of the playlist (which I got with `mpc playlist | wc -l`) I can tell `mpc play` to play the last song in the playlist. But if I select multiple songs, I want it to start playing the first of them, so I need a little bit of simple math to figure out how many songs back to start from the bottom. So if the array is longer than one item, I want to reassign the index variable to the length of the playlist, minus however many items I added from the `$songs` array, and add one (because without adding one I would just have the last item in the playlist before I added anything).

So, putting it all together I came up with this:

``` bash
mapfile -t songs < <(mpc search -f '[%artist% - [%album% - ][%track% - ][%title%]]|%file%' filename '' | fzf -m)
(( ${#songs[@]} > 0 )) || exit
printf '%s\n' "${songs[@]}" | mpc -q add
index=$(mpc playlist | wc -l)
(( ${#songs[@]} > 1 )) && index=$(( index - ${#songs[@]} + 1))
mpc -q play "$index"
```

I replaced `listall` with `search` since that's considered the 'best' way, and added some formatting to the output so it prints tag info rather than just the filename.

The [full script](https://github.com/DanielFGray/fzf-scripts/blob/master/fzmp) I wrote is a lot more involved and adds filter by artist then by album, as well as filtering the playlist, but this was the core functionality I came up with.

I hope this was as educational to you as it was fun for me to make!
