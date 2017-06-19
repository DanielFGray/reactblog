---
layout: post
title: "Parsing Bash Config Files"
category: computers
tags: [linux,bash,programming]
date:  2017/2/21
---

Many times a script is written that needs extra/persistent configuration from the user. In most languages this is no big deal, you just import your json/yaml/toml parser and you're good to go. The common thing to do for many bash scripts that require configuration is to ask the user to put another actual bash script containing variable declarations in the file:

``` bash
# config
foo='bar baz'

# script
#!/usr/bin/env bash
# ...
source $HOME/.config/my_script/config
echo "$foo"  # prints 'bar baz'
```

But this is horrible to me. This doesn't just define variables, this evaluates code! Ideally, a configuration file should be parsed, not evaluated. For a few scripts I've written lately, I've been including a function that parses plain-text in the following format:

``` bash
somekey     some value
anotherkey  some value
anotherkey  another value
# a comment
```

Here's how I parse config files:

``` bash
#!/usr/bin/env bash

declare -r config_dir="${XDG_CONFIG_DIR:-$HOME/.config}/my_script"
declare -r config_file="${config_dir}/conf"

declare somekey=foo    # define a default value
declare -a anotherkey

parse_config_file() {
  local line key val nr=0
  local config_err=()
  while IFS= read -r line; do
    # keep a running count of which line we're on
    (( ++nr ))
    # ignore empty lines and lines starting with a #
    [[ -z "$line" || "$line" = '#'* ]] && continue
    read -r key <<< "${line%% *}"   # grabs the first word and strips trailing whitespace
    read -r val <<< "${line#* }"    # grabs everything after the first word and strips trailing whitespace
    if [[ -z "$val" ]]; then
      # store errors in an array
      config_err+=( "missing value for \"$key\" in config file on line $nr" )
      continue
    fi
    case "$key" in    # here it actually checks for keys and stores their values
      somekey)
        # test to see if a key matches a specific set of values
        if [[ $val =~ ^foo$|^bar$|^baz$ ]]; then
          somekey="$val"
        else
          # more error handling
          config_err+=( "unknown value \"$val\" for \"$key\" in config file on line $nr" )
          config_err+=( '  must be "foo" "bar" or "baz"' )
        fi ;;
      anotherkey) anotherkey+=( "$val" ) ;; # allow multiple keys stored in an array
      *) config_err+=( "unknown key \"$key\" in config file on line $nr" )
    esac
  done
  if (( ${#config_err[@]} > 0 )); then
    printf '%s\n' 'there were errors parsing the config file:' "${config_err[@]}"
  fi
}

[[ -s "$config_file" ]] && parse_config_file < "$config_file"

printf 'somekey is "%s"\n' "$somekey"
printf 'anotherkey contains "%s"\n' "${anotherkey[*]}"

```

Hopefully the comments explain it well enough!
