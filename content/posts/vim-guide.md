---
layout: post
title: "Learning Vim"
category: computers
tags: [vim, unfinished]
date: 2017/2/2
---

A brief (and somewhat complete) history: In the beginning, the UNIX standard editor was `ed`, created by Ken Thompson in 1969. `ed` is a very powerful, very terse, command line interface for editing text, but user-friendliness is not one of it's strengths. In 1976 Bill Joy came along on his [ADM-3A](https://en.wikipedia.org/wiki/ADM-3A) and extended `ed` to become `ex`, and then a couple years later made a visual interface and called it `vi`. Later on, around 1988, Bram Moolenar took `Vi` and improved it with a lot more features, and around 1991 released it and called it `Vim`.

Vi (and hence Vim) is unlike most any other editor. Vim is *modal*. That means things you do in one "mode" will have a different effect than what happens in another mode. Almost every other editor will let you start typing text as soon as you open it. If you do that in Vim there's no telling what will happen.

# Basics

On many systems, Vim will start in compatible mode, which tries to maintain backwards compatibility with the old Vi editor. You can disable this by running `:set nocompatible`, or by starting with `vim -N`, or by creating a `vimrc` file, which we'll try to create a bit later.

Vim's default mode is `normal` mode which uses the letters on the keyboard as mnemonics for commands. To put text into your document with Vim you need to enter `insert` mode, which you can get to with `i`, but there are several other ways that we'll cover. To get back to `normal` mode you should press `<Esc>`, and to quit without saving you can run `:q!`, or to save and quit you can do `ZZ`.

If you make a mistake in Vim, remember that `u` in `normal` mode is undo and `<C-r>` (read as Ctrl+r) is redo.

If you're not sure which mode you're in, push `<Esc>` a couple times and you can guarantee you're back in `normal` mode. You should really try to default back to `normal` mode as often as you can, and by that I mean don't just stay in insert mode all day.

If you're the more "hands-on" type, you might prefer to skip down to [A Simple Vimrc](#A-Simple-Vimrc) and then come back to here afterwards.

# Motions

I think the best thing to learn first in Vim is how to move the cursor. There are literally dozens and dozens of motions, so let's start with some of the basics:

<center>
[![http://www.catonmat.net/blog/why-vim-uses-hjkl-as-arrow-keys/](http://www.catonmat.net/images/why-vim-uses-hjkl/adm-3a-hjkl-keyboard.jpg "from the ADM-3A")](http://www.catonmat.net/blog/why-vim-uses-hjkl-as-arrow-keys/)
</center>

`h` `j` `k` `l` move the cursor left, down, up, and right, respectively. `h` and `l` are easy to remember because they are at the left and right, but `j` and `k` can be easy to mix up at first, so it's helpful to note that `j` kinda almost resembles a down arrow with the way the it exceeds the baseline. We can prepend a `[count]` to any of these, so if we want to move forward by 10 chars we can use `10l` or if we want to go up 3 lines we can use `3k`.

But moving your cursor around by individual characters isn't the most efficient way to do anything, even with adding a `[count]` it's not much better than the arrow-keys. If we want to move the cursor to a specific character on the line we can use `f` `F` `t` `T`.

`f` moves the cursor to the next occurrence of the next letter we give it. If we have "foo bar" on a line and our cursor at the beginning, we can move to the space by typing `f<space>` (where `<space>` is literally the space bar), or we can move to the "b" in "bar" by typing `fb`. So `f` works by moving the cursor to the next character given to it. `F` works similar, but instead of moving from the right of the cursor, it moves backwards from the left of the cursor.

`t` is very similar to `f`, but it moves the cursor to before the next character, so going back to our `foo bar` line, if we were to type `tb` our cursor would now be on the space. Hopefully you can guess how `T` works, it works like `t`, except it works from the left of the cursor.

I remember `f` as "find" and `t` as "to", and their uppercase counterparts move backwards.

There are then two more keys that expand on the power of `f` `F` `t` `T`, and those are `;` and `,`. The `;` key works by repeating the last motion with `f` `F` `t` `T`, and `,` repeats the last `f` `F` `t` `T` but in the opposite direction. We can then prepend a `[count]` to any of these, so if we want to jump to the second occurrence of "o" from the right of the cursor we could use `2fo`.

Home work: read `:h left-right-motions` and find out what the following motions do: `$` `^` `|` `%` `gg` `G` `}`

# Text-objects

Text-objects are, for me, the most compelling feature of Vim. Let's start with words, but first we should understand that Vim has two definitions of a word: `word` and `WORD`. `WORD` is the easiest to define, it's any group of characters surrounded by whitespace, while `word` is slightly harder to define, it's by ranges of similar characters. So `foo b@r` is two `WORD`s, but is four `word`s, because the `@` in `b@r` is it's own separate `word`. I strongly suggest that you read `:help WORD` to see what Vim's built-in help has to say about it (and when that gets in the way, you can close the split with `<C-w>q`, which is read as Ctrl+w then q).

Now that's out of the way, let's learn some motions for dealing with words. `w` moves the cursor forward one `word`, and we can move backwards a `word` with `b`. Their `WORD` counterparts are simply the uppercase versions: `W` moves the cursor forward a `WORD` and `B` moves backwards a `WORD`. You can move to the end of a word with `e`, and you can move backwards a word with `ge` (or `E` and `gE` respectively).

I think now is a good time to introduce another mode: `visual` mode. You can start `visual` mode with `v`, which will let you visually select regions of text starting from the cursor position, similar to holding shift in other editors. If your cursor is at the beginning of a word, you can visually select that word by typing `ve`. You can continue to select more words by successive presses of `e`, but what if your cursor isn't at the beginning of the word? This is where Vim's text-objects really show their true power. From any point in the word you can select the entire `WORD` with `viW`, which you could read as "visually select inside WORD".

There are, of course, many text-objects besides words. How about a sentence? We can navigate forward a sentence with `)` and backwards a sentence with `(`. Unfortunately the syntax for selecting a sentence as a text-object differs slightly here, `vis` would select the sentence, because if we were to run `vi)` it would look for a group of parentheses. That's pretty key there, because I just introduced another text-object: groups of parentheses. You can visually select inside groups of `()` by using either `vi)` or `vi(` (they're both the same to Vim), and to take this one step further, you select things inside curly braces with `vi}`. What's that? You want to select the curly braces as well as their contents? Well let's visually select around them, with `va}`. We can take this inside/around idea to nearly any text-object. If we `vaW` it will select a `WORD` and also a whitespace character around the word. If we do `vas` it will also include a whitespace character around the sentence.

Visual selections aren't just limited to text objects though, you can use any motion. If you wanted to select from the cursor to the next occurrence of a comma, you could use `vf,` and then use the `;` to jump to more commas. Visual mode started with `v` puts you in a character select mode, so you can select as much text as you want by moving the cursor with any motion. You can also select by lines by using `V`, and you can even make rectangular selections with `^v` (that's control+v), which is something I haven't seen in any other editor. 

# Operators

Now that you've learned a dozen motions, and learned how to select text, what can you do with them? This is where operators come in. If you were to think of motions and text-objects as nouns, then operators are verbs.

Deleting is an often used operation in text editing, and in Vim it's done with `d`. Of course, `d` by itself doesn't do anything, "delete what?" Vim asks, and waits patiently for you to tell it. It is at this point where the "composable" nature of Vim's key-bindings shine. Any motion or text-object can almost always be chained to an operator. You want to delete the current word the cursor is on? `daw`. You want to delete the entire sentence? `das`. Similar to the `d` command is `x` which deletes the character under the cursor, while `X` deletes the character before the cursor.

What if you wanted to change a word? Your first thought might be to visually select with `viw` then delete with `d`, and then use `i` to get to insert mode, or you could `diwi`, but there's actually an operator for this: change, with `c`! With this you can `ciw` to change inside words, or you can `ci)` to change inside parentheses.

The last operator I'm going to cover here is yank, which is done with `y`. Yank is similar to copy in most editors: it leaves the text intact while adding it to your "clipboard". You could yank the next 3 words with `y3w`, or the entire paragraph with `yap`. Pasting is done with `p` which will insert the last yanked text after the cursor, or with `P` which will insert before the cursor. `p`/`P` also work with text deleted with `d`, and will also restore the text changed with `c`.

The key take-away here is worth repeating: Any operator can be used with any motion or text-object. If you learn a new motion or operator, you can use it together with your existing operators or motions.

Home work: read the short list of operators `:h operator` and experiment a bit with them.

# A Simple Vimrc

Now that we've got a bit of a handle on moving around and editing text, let's exercise this knowledge and create a configuration file for Vim.

On Linux (and Mac) you should create a file called `.vimrc` in your `$HOME` directory, and on Windows this will be `_vimrc` in your User folder.

I'd like to demonstrate a couple of different ways to edit and insert text while adding settings to the file.

Press `i` to start insert mode, and type the following:

``` vim
set backspace=indent,eol,start " make backspace a bit more sane
```

When you're done typing, press `Esc` to exit insert mode.  
Then press `yy` to yank the entire line, and then press `p` to paste it below.  
You should now have two lines of the same thing.  
Type `2G` then `w` to jump to the second word of the second line where it declares the `backspace` option, then type `cE` to change the backspace setting to `showmode`, then `Esc` back to normal mode.  
Use `f"` then `w` to navigate to the start of the comment, and then use `C` to change the rest of the line so it looks like below:

``` vim
set showcmd " show operator/motion commands as they're typed
```

Now press `o` to start insert mode in a new line below the current one type the following:

``` vim
set hidden " allow buffers to persist in the background without saving
```

And try and follow roughly the same pattern as above for this next line:

``` vim
set ruler " show a ruler with line numbers at the bottom
```

Save this (with `:w`), and then tell Vim to execute this with `:so %`.

`:so` is short for `:source` and '%' is a shortcut to the path of the currently edited file.

Home work: what do `D` and `C` do, and how do they differ from `Y`?

### TODO:
* ex commands like `:s` and `:g`
* block selection with insert/append
* Registers
  * Unnamed register, where yanked, deleted, and changed text go.
* Macros
