## Commands

Alarm
* `.alarm time [description]` - sets an alarm for `time` (format: 2000 -> 20:00) with the `description` (default value is "Alarm") (Authorized Role needed)
* `.clearalarm` - clears an alarm (Authorized Role needed)
* `.selfalarm time [description]` - sets a personal alarm for `time` (format: 2000 -> 20:00) with the `description` (default value is "Alarm") (can be used in DM)
* `.clearselfalarm` - clears a personal alarm (can be used in DM)
* `.settimezone offset` - sets the timezone, `offset` has the same format as `.alarm`'s `time` (0200 -> +02:00) (Authorized Role needed)

Debug
* `.ping` - the bot replies with "pong" message
* `.poke` - the bot replies with "Leave me alone, please."
* `.reload` - reload (Authorized Role needed)

Game
* `.gather [question]` - if `question` is specified starts team gathering with the `question` as the title, otherwise shows the current standing
* `.gatherend` - stops team gathering
* `.csgo? [question]` - like `.gather`, but with CS:GO default values
* `.lol? [question]` - like `.gather`, but with LoL default values

Logging
* `.logstatus` - shows if voice channel activity logging is on/off (Authorized Role needed)
* `.logtoggle` - toggles voice channel activity logging state (Authorized Role needed)

Me
* `.playing [name]` - if `name` is specified, sets the bot's playing tag, otherwise just displays it (Authorized Role needed)
* `.say [text]` - the bot replies with `text`
* `.help` - lists all commands (can be used in DM)

Music
* `.ytplay youtube-link` - plays the audio of the given `youtube-link` (Authorized Role needed)
* `.ytpause` - pauses the music (Authorized Role needed)
* `.ytresume` - resumes the music (Authorized Role needed)
* `.ytstop` - stops the music (Authorized Role needed)
* `.volume percentage` - set to volume to the given `percentage` (0-100) (Authorized Role needed)

Poll
* `.poll question;option;option[;option...]` - starts a poll with the `question` and all the `options`
* `.pollstat` - shows the current standing of the poll, if there is one
* `.pollend` - closes the current poll and shows the final result