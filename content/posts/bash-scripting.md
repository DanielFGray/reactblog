---
layout: post
title: "Bash Scripting"
category: computers
tags: [linux,bash,programming,unfinished]
date:  2017/2/15
---

Bash is perhaps one of the hardest languages to learn how to script with, simply for the fact there's so much bad information out there.  
I'd like to share some tips and tricks I've learned in my few years of scripting.

# Variables

In bash, you can store things into variables very easily:

``` bash
foo='bar'                  # a string
bar=1                      # a number
baz=( 'foo' 'bar' 'baz' )  # an array
```

* You cannot put spaces around the `=` operator.
* You're not always required to quote variables that are single words, but I think its a good habit to start. Not quoting variables and strings can lead to lots of errors, and there's no harm in using them.
* You may be used to seeing bash variables in uppercase, but you should only use those when they are environment variables, all local script variables should be lower case.
* Bash technically does not have data types as other languages do. Just about every kind of data is stored as a string. Numbers are strings which can be coerced into integers when necessary, but they're still really just a string. Bash has no boolean types, you can assign `foo=true` but `true` is just a string.

While not required, it's a good practice to initialize your variable before-hand. Before assigning a value to a variable, first `declare` the variable, like so:

``` bash
declare foo
foo='bar'
```

To access the contents of a variable you "expand" it by prepending `$`:

``` bash
echo "$foo"
```

Any use of a variable should always be wrapped in double-quotes.

# Conditionals

You can compare two strings to see if they're identical like so:

``` bash
foo='foo'
if [[ "$foo" = 'foo' ]]; then
  echo 'true!'
fi
```

* You should only use a single equals sign when comparing strings.
* A test will return 0 or 1, and as opposed to other languages, `0` is truthy, while `1` means an error. When a command fails to execute, that command often returns `1`. I like to think of it as the amount of errors: `0` means no errors, return values greater than `0` mean there were 1 or more errors.
* This isn't a POSIX `sh` script, so we use Bash's `[[` instead of `[`.

A common habit in shell scripting is to rely on external tools to do a lot of work for you. If you can avoid it, try to. Using external tools can be expensive and slow, and bash has a surprising number of features that you can use instead of shelling out to an external tool.

For example, if you wanted to test whether a string occurred in a larger piece of text, your first thought might be to `grep` for it, but bash can do that itself:

``` bash
foo='some piece of text'
if [[ "$foo" = *'piece'* ]]; then
  echo 'found a piece'
fi
```

This is called a *glob*, and they're one of the handiest tools in your bash tool-belt.

Another common thing is to replace part of a string with another string, which many people will use `sed` for like so:

``` bash
foo='some piece of text'
echo "$foo" | sed 's/piece/thing/'
```

Two things are bad here, the first is using an unnecessary `echo`, it could be done with

``` bash
sed 's/piece/thing/' <<< "$foo"
```

But `sed` is entirely unnecessary in this case, we can do simple string replacements with a *parameter expansion*:

``` bash
foo='some piece of text'
echo "${foo/piece/thing}"
```

I could spend all day talking about all the cool things you can do with parameter expansions, but they're all listed in the man page for bash, just search for `Parameter Expansion`.

There are also lots of different tests you can do with `[[` besides comparing strings, as an example, you might want to test if a file exists and has a non-zero size, which you would do with `[[ -s "$filename" ]]`. There are many unary tests like this, exhaustively listed in man page for bash under the `CONDITIONAL EXPRESSIONS` heading.

---

You also might want to compare numbers, and for this we have a slightly different type of conditional:

``` bash
read -r -p 'Enter a number: ' number
if (( number < 5 )); then
  echo "$number is pretty small!"
fi
```

`((` is called *arithmetic evaluation*, and one of the neat things about it is you don't need to quote your variables or prefix them with `$`, because there are no spaces in numbers, and strings are assumed to be variables. If you're doing anything with numbers, you'll want to use `((` instead of `[[`.

---

Above, I introduced `read`, and it is also one of the must-have's in your toolbelt. Read takes input and assigns it to a variable. `read -r -p 'Enter a number: ' number` here takes it's input and assigns it to `number`. The `-p` flag is used to provide a 'prompt'. The `-r` flag is difficult to explain and I won't bother, but you should ***ALWAYS*** use `read` with it. Bad things will happen to you and your family if you don't.

One of the features of `read` is that it takes input from a tty (as demonstrated above where it stores user's input), or it can take input from stdin, like so:

``` bash
read -r x y < <(printf '1 2')
echo "$x"   # x is assigned to 1
echo "$y"   # y is assigned to 2
```

This works because read splits by `IFS`. If you're curious about IFS and how it works, [read this post on StackExchange](http://unix.stackexchange.com/a/184867).

---

If you want to test whether a single value is one of a few values, you could use many `if` statements:

``` bash
if [[ "$my_var" = 'foo' ]]; then
  echo 'var is foo'
elif [[ "$my_var" = 'bar' ]]; then
  echo 'var is bar'
else
  echo "I don't recognize that value"
fi
```

Or, you can use a `case` statement:

``` bash
case "$my_var" in
  foo) echo 'var is foo' ;;
  bar) echo 'var is bar ;;
  *) echo "I don't recognize that value"
esac
```

# Loops

Loops are pretty similar as other languages. The most simple way to loop is with `while`:

``` bash
i=1
while (( i < 5 )); do
  printf "$i "
  (( ++i ))
done
printf "$i"
```

This will print the numbers 1 through 5.

You could also use an infinite while loop and break manually:

``` bash
i=0
while :; do
  (( ++i ))
  printf "$i "
  (( i >= 5 )) && break
done
```

We could even do this with the more C-style for loop:

``` bash
for (( i=5; i > 0; --i )); do
  printf "$i "
done
```

Or, better yet, we can do *brace expansion* with a for-in loop:

``` bash
for i in {1..5}; do
  echo "$i"
done
```

---

Brace expansion is really nifty, in the above example it expands to a list of numbers, 1 through 5 all inclusive.

You can also use brace expansion with strings:

``` bash
echo foo{-bar,-baz}
```

And you can even nest them:

``` bash
echo foo{,-{bar,baz,{1..3}}}
```

But, back to loops.

---

When you have many files you want to iterate over, the best way (and only reliable way) is with a glob:

``` bash
for file in *; do
  echo "$file"
done
```

The above matches all files in the current directory. This won't match hidden files (files prefixed with a '.'), for that you'd want another glob (or to `set dotglob`):

``` bash
for file in some_path/{*,.*}; do
  echo "$file"
done
```

You can easily match file extensions, and with `set globstar` we can even recursively search through directories:

``` bash
set globstar
for file in **/*.{mp3,flac}; do
  echo "$file"
done
```

If you have a file you want to read lines from, you should use a `while` loop like so:

``` bash
while IFS= read -r line; do
  echo "$line"
done < some_file
```

Or, if you want to iterate over lines from a command:

``` bash
while IFS= read -r line; do
  echo "$line"
done < <(some_cmd)
```

# Arrays

Arrays should be declared as such:

``` bash
declare -a my_array
my_array=( 'foo' 'bar' 'baz' )
```

We can append items to the array, and use brace expansion:

``` bash
my_array+=( foo{,-{bar,baz,{1..3}}} )
```

Iterating over an array is done like so:

``` bash
for item in "${my_array[@]}"; do
  echo "$item"
done
```

The number of elements in an array can be retrieved with `{% raw %}${#my_array[@]}{% endraw %}`, and an individual item can be retrieved with `${my_array[index]}`.  
As an example (read: don't actually do this), you could iterate over an array with a C-style loop:

``` bash
for (( i=0; i < ${#my_array[@]}; ++i )); do
  item="${my_array[$i]}"
  echo "$item"
done
```

You can use `mapfile` to turn lines into an array:

``` bash
mapfile -t my_array < <(some_cmd)
for line in "${my_array[@]}"; do
  echo "$line"
done
```

Associative arrays can be created as such:

``` bash
declare -A colors
colors[red]=$(tput setaf 1)
colors[green]=$(tput setaf 2)
colors[blue]=$(tput setaf 4)
colors[reset]=$(tput sgr0)
```

And then you can access elements by name instead of numeric index:

``` bash
printf '%s%s%s\n' "${colors[red]}" 'this is a red message' "${colors[reset]}"
printf '%s%s%s\n' "${colors[blue]}" 'this is a blue message' "${colors[reset]}"
printf '%s%s%s\n' "${colors[green]}" 'this is a green message' "${colors[reset]}"
```

Which is ideal in this case because it only makes a few calls to `tput`, effectively "caching" it's output for use later.

# Further reading

* http://bash.academy
* http://mywiki.wooledge.org/BashGuide

---

TODO:
* functions
* things not to do
