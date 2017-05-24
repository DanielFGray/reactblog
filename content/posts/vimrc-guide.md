---
layout: post
title: Vim beginner's customization guide
category: computers
tags: [vim]
date: 2015/08/02
---

This article is for those who've been using Vim for a little while and have started to grasp modal editing and the powers of Vim, and now want to start customizing it. If you're completely new to Vim, I have another post describing some of the basic of learning Vim [here](/computers/vim-guide) but there are dozens of them on the internet, and Vim ships with `vimtutor` as well which is a great place to start.

If you already have someone else's `vimrc` or are using a distribution like *Janus* or *spf13* then I suggest you delete it. You likely have no idea what it does and it means nothing to you. I'm not going to explain how to use someone else's config, I'm going to attempt to walk you through the process of creating your own, which is much more rewarding, although do keep in my mind I'm really only going to give you my own opinions on the process and attempt to save you from some of the boring legwork of testing things out (which admittedly can also be a rewarding process).

As this is not an introduction to writing VimScript, and targeted at beginners, a lot of this is suggesting plugins. Some people don't like plugins, and want to write their own VimScript to do similar things as existing plugins, or just want to use vanilla Vim. I'm not exactly keen on Vim's defaults (and I imagine neither are you if you're reading this), and I'm not a fan of reinventing the wheel, so I have no problem with using other people's plugins. If you're the type to worry about how many plugins you're using you might as well stop reading now, but keep in mind I currently use over 100 plugins and have yet to be bothered by any significant performance penalties on my modest laptop.

This is written under the assumption you're running a Linux distro, but much of this will work on Mac, and some of it on Windows too. Your mileage may vary.

# Initial configuration

At this point I'm assuming you have no `~/.vim` directory and no `~/.vimrc` file. Let's make a directory skeleton to use in your `vimrc` later with this command:

``` bash
mkdir -vp ~/.vim/{autoload,bundle,cache,undo,backups,swaps}
```

Then, let's install a plugin manager called [vim-plug](https://github.com/junegunn/vim-plug/) with this command:

``` bash
curl -fLo ~/.vim/autoload/plug.vim https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
```

<small>*(Aside: There are definitely many choices of plugin managers, but to me, vim-plug is the best of them; the syntax is very clean and it does parallel processing which makes updates so much faster than others. The other biggest contender would be [NeoBundle](https://github.com/Shougo/neobundle.vim) which offers more fine-grained control, but I find the extra control is rarely needed, and vim-plug will do just about all of that anyway and with cleaner syntax. There's also [Vundle](https://github.com/gmarik/Vundle.vim) but it doesn't have delayed loading of plugins which is a really great feature not to be missed out on.)*</small>

Now, open your `~/.vimrc` with Vim, and let's use Vim-plug to install a minimal, [sensible](https://github.com/tpope/vim-sensible), set of default options by adding the following lines:

``` vim
call plug#begin('~/.vim/bundle')
Plug 'tpope/vim-sensible'
Plug 'shougo/vimproc', {'do': 'make'}
call plug#end()
```

There's an extra plugin there called [vimproc](https://github.com/shougo/vimproc) that you'll want to let Vim do things asynchronously, or non-blocking-ly, so that things can run in the background without making Vim freeze. The second half of that tells Vim-plug to run the command `make` whenever it's installed or updated.

Now let's save this file and install the plugin with this command: `:w | so % | PlugInstall`. You're hopefully familiar with `:ex` commands like `:w`, `:q`, and `:s` but you may not be aware you can chain them together with `|`. This is equivalent to running `:w`, then `:so %` which is a shortcut for `:source <current filename>`, and then running `:PlugInstall`. At this point I would recommend taking a [look at the options](https://github.com/tpope/vim-sensible/blob/master/plugin/sensible.vim) Vim-sensible defines.

As you're working/reading through this article, try to add comments to help you remember what things do later on (comments are started with `"` but I prefer to use two of them). If you find yourself wondering what a setting does, put your cursor on the word and run `:help <C-r><C-w>` (where &lt;C-r&gt;&lt;C-w&gt; means Ctrl+r then Ctrl+w).

# More sensible configurations

Vim's default nature when handling buffers is to not allow opening a new one or changing to a new buffer without saving change to the current one. Anyone who's spent any time in another editor will likely find this incredibly annoying (at least I do), and want Vim to just remember their changes for the moment and focus on a new buffer without prompting to save first. This line will do that:

``` vim
set hidden
```

---

I might have said this earlier, but any options you add to your `vimrc` are not read by the current instance, unless you run `:source ~/.vimrc`. You can write an `autocmd` to do this automatically whenever you save, but if you make a typo and save it, you're gonna have a bad time. See the bottom if you want this functionality. This is probably a good time to let you know that if you do make a typo and your config file for some reason stops you from using Vim properly, you can tell Vim to start in 'safe mode' with `vim -u NONE` (I tend to add the `-N` switch also to make Vim force `nocompatible` mode).

---

I quite like having line numbers in a text editor, and in recent versions there's also *relative* line numbering which is great to have in Vim, since you're most often moving around relative to your position rather than to an absolute line (which, of course, can still be done). The following lines will add line numbers and relative line numbers (or not if you're using a version that doesn't support it):

``` vim
set number
if exists('+rnu') | set relativenumber | endif
```

If you prefer, you can split that into multiple lines where the `|` bars are.

---

I'm going to suggest yet plugin (did I mention this article will be filled with lots of them?) from Tim Pope called [unimpaired](https://github.com/tpope/vim-unimpaired) that adds a bunch of keybinds that, I think, should be added by default.

``` vim
Plug 'tpope/vim-unimpaired'
```

With this plugin you can now toggle line numbers with `con` and relative numbers with `cor`. My most used features of this plugin are changing buffers with `[b` and `]b` and pasting with `yo`/`yO`. You should read the list of all these key-binds by running `:vert help unimpaired`. I cannot stress the importance of this: you should really, **really**, read the help file of every plugin you add to your `vimrc`. You can get a list of all help files for your plugins by running `:help local-additions`.

---

tpope has another great plugin that I use a lot that proves Vim commands for some common UNIX commands. As an example, I often decide I want to rename or move a file in the middle of working on it, and while `:saveas` almost does the trick, it still leaves the original file on disk, and (Eunuch)[https://github.com/tpope/vim-eunuch] provides a :Move command to solve this problem. As another example, I sometimes start editing a file, and find that I need root privileges to write to it, and this plugin provides `:SudoWrite`.

``` vim
Plug 'tpope/vim-eunuch'
```

---

Another one of tpope's great plugins is [surround](https://github.com/tpope/vim-surround). This "provides mappings to easily delete, change and add such surroundings in pairs." The README and help file does a great job of explaining how to use it so I won't bother with that here.

``` vim
Plug 'tpope/vim-surround'
```

---

Before I forget, and while I'm still talking about tpope, there's yet another plugin he's written that expands on the power of the `.` command which repeats the last action. `.` doesn't always work with plugins, so this plugin attempts to fix that.

``` vim
Plug 'tpope/vim-repeat'
```

---

Vim has a very powerful [undo *tree*](http://vimcasts.org/episodes/undo-branching-and-gundo-Vim/), which is different from the linear undo lists most editors use. Having this tree be persistent even after quitting is one of my favorite features of Vim, and so is having your `:ex` command history be persistent. The following lines will accomplish this:

``` vim
if version >= 703
    if exists("&undodir")
        set undodir=~/.vim/undo//
    endif
    set undofile
    set undoreload=10000
endif
set undolevels=10000
if exists("&backupdir")
    set backupdir=~/.vim/backups//
endif
if exists("&directory")
    set directory=~/.vim/swaps//
endif
```

There's also a plugin called [gundo](https://github.com/sjl/gundo.vim) that I recommend adding to graphically navigate the undo tree. Vim-plug also has the ability to not load this plugin until you actually use it, although most of the time this isn't necessary because Vim natively has on-demand loading of plugins if they're written correctly.

``` vim
Plug 'sjl/gundo.vim', {'on': 'GundoToggle'}
```

If you want to bind opening this to a key, you can do that with

``` vim
nnoremap <silent> <F5> <Esc>:GundoToggle<CR>
```

But you can, of course, replace `<F5>` with something else like `<leader>u` if you prefer. Make sure to read the help file for Gundo, there's several settings in there you can tweak.

---

This is probably a good time to explain mappings and why I chose that particular string of characters. `map` is the most primitive way in Vim to make a key map to a certain command or function, but map is recursive and this is usually an undesired effect, so `noremap`, as in "non-recursive" `map` is usually used. `nnoremap` (notice the extra `n` at the beginning) is a non-recursive map in normal mode. I used `<silent>` here because I don't prefer to have the command print in the command prompt. I add the `<Esc>` to make sure the `:ex` command is entered exactly as intended and there weren't any previously entered characters like numbers added that might cause undesired effects. The `<CR>` at the end is short for 'carriage return', which is how you tell Vim to push enter and actually execute the command.

---

Vim-sensible enables `incsearch` which highlights the first match as you type, which is great and all, but there's a pretty awesome [plugin](https://github.com/haya14busa/incsearch.vim) that expands on this power to not just highlight the first match, but all visible matches on the screen, which is extremely handy for writing regex. (Again, make sure to check the help file!)

A note on organization: Your `vimrc` can quickly become a jumbled mess if you're not careful, so I find it helps to group things into folds. For instance, in my `vimrc`, I use several settings for this plugin, so directly underneath the plugin definition I add the settings and then wrap the whole block in a fold. This lets me use `zc` to close the fold (which hides the contents), and then `zo` to open it (or `zm`/`zr` to increase/decrease the `foldlevel`). The entire block looks like so:

``` vim
Plug 'haya14busa/incsearch.vim' " {{{
  map /  <Plug>(incsearch-forward)
  map ?  <Plug>(incsearch-backward)
  map g/ <Plug>(incsearch-stay)
  map n  <Plug>(incsearch-nohl-n)
  map N  <Plug>(incsearch-nohl-N)
  map *  <Plug>(incsearch-nohl-*)
  map #  <Plug>(incsearch-nohl-#)
  map g* <Plug>(incsearch-nohl-g*)
  map g# <Plug>(incsearch-nohl-g#)
  let g:incsearch#consistent_n_direction = 1
  let g:incsearch#auto_nohlsearch = 1
  let g:incsearch#magic = '\v'
" }}}
```

I also use incsearch in conjunction with [vim-over](https://github.com/osyo-manga/vim-over) for live preview of substitutions:

``` vim
Plug 'osyo-manga/vim-over' " {{{
  let g:over_command_line_prompt = ":"
  let g:over_enable_cmd_window = 1
  let g:over#command_line#search#enable_incsearch = 1
  let g:over#command_line#search#enable_move_cursor = 1
  nnoremap <silent> <Leader>s <Esc>:OverCommandLine %s///g<CR><Left><Left>
  xnoremap <silent> <Leader>s <Esc>:OverCommandLine '<,'>s///g<CR><Left><Left>
" }}}
```

---

One of my new favorite plugins is [vim-sneak](https://github.com/justinmk/vim-sneak) and I can't believe how long I went without it. This overrides the `s` command (which has the same effect as `xi` or `cl`) to provide a motion that lets you jump to the next two characters you give it. If you've seen EasyMotion (which I strongly dislike), it's similar to that but faster and more lightweight, and actually provides a motion for use with operators (instead of just moving your cursor). It can also extend `f` `F` `t` `T` `;` `,` to work across multiple lines which is killer. Be sure to read the `:help` file for it (have I said this enough yet?), there's some settings you'll definitely want to play with.

The settings I use for this are:

``` vim
Plug 'justinmk/vim-sneak' " {{{
  let g:sneak#prompt = '(sneak)» '
  map <silent> f <Plug>Sneak_f
  map <silent> F <Plug>Sneak_F
  map <silent> t <Plug>Sneak_t
  map <silent> T <Plug>Sneak_T
  map <silent> ; <Plug>SneakNext
  map <silent> , <Plug>SneakPrevious
" }}}
```

---

[targets.vim](https://github.com/wellle/targets.vim) is a very cool plugin that provides some extra modifiers and text-objects to operate on. Vim-surround adds the surround text-object, and while Vim provides you with `ci)` to "change inside parenthesis", this really only works if your cursor is inside the parenthesis. Targets provides (among many other things) modifiers like `cin)` to "change inside next parenthesis". You'll have to read the help file for all of the features it provides.

Since text-objects are arguably Vim's most compelling feature, why not take advantage of the ability to create our own? [kana/vim-textobj-user/wiki](https://github.com/kana/vim-textobj-user/wiki) has a list of dozens of custom text-objects you can install, and of course the engine gives you the ability to create your own.

# Fancy suggestions

Determining whether a file is using tabs or spaces consistently isn't easily done, but Vim has a few features for handling non-visible chars. You'll want to check the help files for more information.

``` vim
set list listchars=tab:\›\ ,trail:★,extends:»,precedes:«,nbsp:•
"" set listchars+=eol:↵  "" uncomment this line if you want to show end of line chars
set fillchars=stl:\ ,stlnc:\ ,vert:│,fold:\ ,diff:-
```

---

As far as looks go in Vim, compared to more modern editors, it's not exactly the nicest to look at. There are a dozens plugins that attempt to spice up Vim's interface, I have found [Airline](https://github.com/bling/vim-airline) very attractive to look at and very functional while not being too heavy on resources. On top of having a nice statusline at the bottom telling you which mode you're in (and changing colors accordingly), it will also list all of your open buffers or tabs in the tabline.

If that's too fancy for you, you can play with the `ruler`, which by default only shows the current line number and column, but you can put many things in the ruler:

``` vim
set rulerformat=%30(%=\:b%n%y%m%r%w\ %l,%c%V\ %P%)
```

If you want to learn how all the syntax works, check out `:h statusline`.

# Programming specific plugins

If you're like me and you spend a lot of time using Vim to write code you'll probably want to make it behave a bit like an IDE, and get some syntax checking and/or code completion added to Vim.

If you want syntax linting, you can try [Syntastic](https://github.com/scrooloose/syntastic) if you're stuck with an older version of Vim, but if you're using Vim 8 (or NeoVim) you should use look into [ALE](https://github.com/w0rp/ale). The biggest selling point of ALE is that it shows errors while you're typing without making the editor hang (which is a problem with Syntastic which can grind the editor to a halt after a saving a file). [NeoMake](https://github.com/neomake/neomake/) is another choice but I can't think of any reason to use it over ALE.

Next, I recommend using snippets. Snippets are shortcuts allow you to, for instance, type `for<C-k>` and have Vim move your cursor around while you fill in the blanks. There are two major choices: [UltiSnips](https://github.com/SirVer/ultisnips) and [NeoSnippet](https://github.com/Shougo/neosnippet.vim). Honestly I never tried UltiSnips, mostly because NeoSnippet ties in nicely together with the completion engine I use. Keep in mind both of those are just the engine, there are separate plugins for the actual libraries. As always, check the README.

---

When it comes to code-completion, while Vim's built-in completion is pretty great, it does leave something to be desired if you're looking for something that intelligently parses your code. There are at least half a dozen choices, and some of them have drawbacks compared to others, so you'll really want to spend a little time playing with each and see which you prefer most. I've narrowed it down to two:

* [YouCompleteMe](https://github.com/valloric/youcompleteme) - Perhaps the most popular, this is really good at completion for C-languages and also works for Python and has support for a few other languages. It's pretty kind of complicated to install and depends on `clang`.
* [NeoComplete](https://github.com/shougo/neocomplete) - This is the one I use, mostly because I don't work with C-languages and it seems to function how I'd expect, but it depends on Vim's Lua support (which you can test by looking for `+lua` in `vim --version`). [NeoComplCache](https://github.com/Shougo/neocomplcache.vim) is similar but doesn't have the same dependencies nor quite the same feature set. There's a newer version of NeoComplete called [Deoplete](https://github.com/shougo/deoplete.vim) that Shougo is working on for NeoVim and the new async features of Vim 8; as of this writing it's not 100% finished, but it's worth trying.

It's also possible to use YouCompleteMe if `clang` is available, or attempt NeoComplete if it can, and fall-back to NeoComplCache if all else fails, so I wrote a [gist](https://gist.github.com/DanielFGray/f6d7671ec08f7f95f879) for this idea (though I never actually tested it, so let me know how it works if you try it).

If you do web development then you'll most definitely want [emmett.vim](https://github.com/mattn/emmet-Vim) which is more of a text *expander*: it lets you write CSS-style selections and then expands them in to the markup it requires. For example `ul>li*2` expands to `<ul><li></li><li></li></ul>` (but with linebreaks and indention). Emmet is completely life-changing for writing HTML/XML/JSX. [Here's a cheat-sheet](http://docs.emmet.io/cheat-sheet/) to help you get started with some of the expansions it provides.

---

A few more goodies for you:

* [delimitMate](https://github.com/Raimondi/delimitMate) - this will add matching parenthesis, quotes, braces, brackets as soon as you type the first one. I cry whenever I use Vim and this isn't available.
* [endwise](https://github.com/tpope/vim-endwise) - provides a few closing lines for things like `if`, `for`, `function`, etc in several languages
* [commentary](https://github.com/tpope/vim-commentary) - provides a `gc` verb for commenting lines with motions or selections
* [fugitive](https://github.com/tpope/vim-fugitive) - another one of tpope's great contributions, it may very well be the best Git wrapper of all time
* [git-gutter](https://github.com/airblade/vim-gitgutter) - a handy companion to fugitive that shows diff signs from the current commit beside line numbers
* [gist](https://github.com/mattn/gist-Vim) - speaking of Git, it's often really handy to send a file or just a selection of a file to gist to share with people. This plugin does that very nicely
* [filebeagle](https://github.com/jeetsukumaran/vim-filebeagle) - if you've come from IDE-land you may be tempted to try and find some sort of file browser for Vim. NERDtree is one of the more popular choices for this, but it uses splits which can be disruptive to your other splits, and personally just does too much. I've been using filebeagle which does two things: lists and opens files.

# Prose plugins

If you're into writing prose there are a few plugins I've found that help with this:

* [vim-pencil](https://github.com/reedes/vim-pencil) - provides commands for changing word wrap settings between hard and soft style
* [vim-lexical](https://github.com/reedes/vim-lexical) - improves spell-check and adds thesaurus completions
* [vim-textobj-sentence](https://github.com/reedes/vim-textobj-sentence) - improves the built-in sentence text-object with recognition for common abbreviations and quotations
* [vim-wordy](https://github.com/reedes/vim-wordy) - highlights problematic phrases and words

# Even more plugins

A popular choice for many users is [CtrlP](https://github.com/ctrlpvim/ctrlp.vim), which lets you fuzzy filter through files, buffer, tags, etc. It's pretty simple to configure and many users love it.

Another choice for filtering through lists is [FZF](https://github.com/junegunn/fzf). FZF isn't actually a Vim plugin (although Junegunn has made [an extension for it](https://github.com/junegunn/fzf.vim)), but a generic fuzzy filter program, that reads stdin and prints selections to stdout, so it can be used with any program. I've written probably half a dozen [scripts with FZF](https://github.com/DanielFGray/fzf-scripts) and it's a great program, but the biggest catch is that for it to work cleanly in Vim you need to run Vim inside tmux so it can create a tmux split below Vim. If you use FZF without tmux or inside GVim, FZF will spawn an external terminal to show the filter list. Although, if you use NeoVim, this isn't an issue since it implements it's own terminal emulator, and can run FZF directly in a Vim split.

[Unite.vim](https://gitub.com/shougo/unite.vim), is a bit more ambitious, and I think it takes a bit of inspiration from Emacs' helm. Unite is very extensible, it comes with a dozen sources (which is 'Unite speak' for inputs like the buffer list, yank history, register contents, etc) out of the box, and there are probably hundreds more you can install (there are plugins for this plugin). It doesn't come with any default mappings, you will have to define your own, and it will take some time configuring (and possibly/probably a bit of head scratching), but it is a very powerful plugin.  
Arguably the best feature about Unite is that you can combine 'sources' to filter through. For example, I have `<leader>f` bound to show files in the current working directory (and I can navigate through folders by typing through paths), most recently used files, any file that might match what's under the cursor (similar to the `gf` command), or if nothing else matches, create a new file. It can be configured to show as a split below, above, or to the side of the current buffer, or can use the entirety of the current buffer (similar to the netrw interface, but with the whole interactive filter bit), and you can define certain commands to split and behave differently than others.

---

I've never used Sublime Text, but I found a plugin that tries to implement it's [multiple cursors](https://github.com/terryma/vim-multiple-cursors) feature, which is useful for all kinds of things, especially variable renaming.

---

If you use tmux you might want some integration with it and REPLs in other panes. There are lots of these plugins that do things slightly differently so you should try a few and find one that does what you like. I use [tmuxify](https://github.com/mhinz/vim-tmuxify) because it was the first I found that worked how I expected.

# Personal tweaks

If you have a lot of `<leader>` key mappings, you'll probably find that the default `\` key can be a bit hard to reach. Well, the space bar doesn't really do much besides advance the cursor one char, just like `l` does, so I think it's a great candidate for being `mapleader` since it's so easily accessible.

``` vim
let g:mapleader = "\<Space>"
```

---

The default behavior of `Y` is to yank the entire line (which can be done with `yy`), but I like `Y` to behave more like `C` and `D`, which work from the cursor to the end of the line.

``` vim
nnoremap Y y$
```

---

When searching with `n` and `N` I often find it difficult to see exactly where the next search was, so I use `zt` to put that line at the top of the scrolling area (or `zz` to center the line). Sometimes the search is inside a fold that I have to open with `zv` to see it. At some point I realized I do this so often that I should really just make it my default behavior:

``` vim
nnoremap n nzvzt
nnoremap N Nzvzt
```

<small>*note that if you're using the [incsearch](https://github.com/haya14busa/incsearch) plugin to handle all of your searching you'll have to add the `zvzt` to the end of that plug mapping*</small>

---

If you've used Vim with wrapped text, you may have noticed that `j` and `k` don't quite behave as expected, as they jump literal lines and not visible lines, which is done with `gj` and `gk`. I thought it would be handy to have a function to swap them around as needed, so here it is:

``` vim
function! Togglegjgk()
  if !exists("g:togglegjgk") || g:togglegjgk==0
    let g:togglegjgk=1
    nnoremap j gj
    nnoremap k gk
    nnoremap gk k
    nnoremap gj j
    echo 'j/k swapped with gj/gk'
  else
    let g:togglegjgk=0
    nunmap j
    nunmap k
    nunmap gk
    nunmap gj
    echo 'normal j/k'
  endif
endfunction
nnoremap <silent> <leader>tgj <Esc>:call Togglegjgk()<CR>
```

---

Early in the text I mentioned `autocmd`, which is a very powerful feature in Vim. They do have some caveats to be aware of, and the syntax is slightly strange at first, so check out `:h autocmd`. Any time your `vimrc` is re-sourced Vim will re-add your autocmds to it's list, so it's good to wrap them in either an `augroup` to clear them, or a condition to not re-load them (I opt for the former). Here's a quick sample of how to `:source` your `vimrc` whenever it's saved, and, if you're using Airline, fix a strange quirk it has when re-sourcing:

``` vim
augroup VIM
  autocmd!
  autocmd BufWritePost ~/.vimrc
  \ source ~/.vimrc |
  \ if exists(':AirlineRefresh') |
  \   AirlineRefresh |
  \ endif
augroup END
```

Because help files are so helpful in Vim, I find myself reading them a lot (and hopefully you have been too), but by default most of the help splits are horizontal (which makes no sense to me), so I have a couple `autocmd`s for dealing with them. The first is to try and make all help splits vertical on the far right side and resized to 80 columns, and the other uses the `:help <C-r><C-w>` trick we used earlier and binds it to `K`, which by default runs `man` on the word your cursor is in. Again, this would go inside the `augroup` above:

``` vim
autocmd FileType help
\ wincmd L |
\ vert resize 80
autocmd FileType Vim
\ nnore <silent><buffer> K <Esc>:help <C-R><C-W><CR>
```

You can also use an `autocmd` to load your last known cursor position whenever a file is read. Put this inside the block above.

``` vim
autocmd BufReadPost *
\ if line("'\"") > 0 && line("'\"") <= line("$") |
\   exe 'normal! g`"zvzz' |
\ endif
```

---

If you want your Vim config to be more portable, it's possible to use your `.vimrc` to recreate your whole `~/.vim` directory. This block will create missing directories and install Vim-Plug and the rest of your missing plugins: *(works best at the top of the file)*

``` vim
let s:configdir = '~/.vim'
if has('nvim')
  let s:configdir = '~/.config/nvim'
endif

if empty(glob(s:configdir . '/bundle')) || empty(glob(s:configdir . '/autoload/plug.vim'))
  augroup InstallPlugins
    autocmd!
    autocmd VimEnter * call s:InstallPlugins()
  augroup END
  function! s:InstallPlugins() abort
    redraw!
    echo 'Install missing plugins? [y/N] '
    let l:char = nr2char(getchar())
    if l:char ==? 'y'
      silent call system('mkdir -p ' . s:configdir . '/{autoload,bundle,cache,undo,backups,swaps}')
      silent call system('curl -fLo ' . s:configdir . '/autoload/plug.vim https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim')
      execute 'source ' . s:configdir . '/autoload/plug.vim'
      PlugInstall
   endif redraw!
  endfunction
endif
```

---

Closing windows can be done a few different ways in Vim. `:q` will close the window and exit Vim if it's the only window open, `:bd` will delete the current buffer from memory but it will leave the window showing. `<C-w>q` will close the window but it won't remove the buffer, and that's without bringing tabs into it. That's a lot of thinking for a simple task, and keystroke or two more than I care for. [Sayonara](https://github.com/mhinz/vim-sayonara) is a plugin that attempts to simplify this process with two commands: `:Sayonara` which removes the buffer and closes the window, and `:Sayonara!` (with the exclamation!) which removes the buffer but preserves the window. That's a lot more typing, so it needs a key-binding. The `Q` key starts you in `:ex` mode which is more often used on accident, and you can still get to this by typing `gQ` in normal mode, so I wrote this little function to override it and close buffers by typing `QY`, `Qy`, or `Qc`:

``` vim
function! PromptQuit()
  echo 'Y - kill buffer and current window'
  echo 'y - kill buffer but preserve window'
  echo 'c - kill window but preserve buffer'
  echo 'close current buffer? '
  let char = nr2char(getchar())
  if char ==# 'Y'
    Sayonara
  elseif char ==# 'y'
    execute 'Sayonara!'
  elseif char ==? 'c'
    wincmd q
  endif
  silent! redraw!
endfunction
nnoremap <silent> Q <Esc>:call PromptQuit()<CR>
```

Keep in mind that closing the last only window will also close Vim.

---

My last suggestion, which is not a tweak for Vim per-se, but is extremely beneficial for Vim users, is to swap your caps-lock and escape keys around. I mean, who actually makes consistent use of caps lock to want it on the home row within pinky's reach? That space would be much better suited for the escape key, and is actually how Bill Joy, the original author of `vi` expected the keyboard layout to be. On Linux you can do this with a single command:

```
setxkbmap -option 'caps:swapescape'
```

You may even want to look into [xcape](https://github.com/alols/xcape), which can make your caps-lock key function as escape when pressed by itself, or act as control when used as a modifier with another key.

## //TODO:

this is still a work in progress

* more cool Vim tricks
* further reading
  * [my vimrc](https://gitlab.com/DanielFGray/dotfiles/blob/master/vimrc)
  * [Steve Losh - Learn VimScript the Hard Way](http://learnvimscriptthehardway.stevelosh.com/)
  * [IBM DevWorks - Scripting the Vim editor](http://www.ibm.com/developerworks/library/l-vim-script-1/)
