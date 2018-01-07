My Progress
=============

I personally do not like productivity tools, but I thought it might be useful to have a super minimal command-line utility that could help me catch myself if I start getting lazy about certain habits. Progress aims to be a tool that, given the least amount of input possible, will allow you to hold yourself accountable to your productivity goals.

Go go go!
---------

You should be able to call my-progress easily from anywhere in the terminal, so first add a simple alias to my-progress to your dot-file. Your alias should point to the `progress.js` file inside the `src` directory and will look something like this:
`alias mp='node /Users/cool.guy/cool-projects/progress/src/progress.js'`
I will continue to use the `mp` alias throughout this documenation.

add user
--------
`mp --new-user ${name}`

This command adds a new user to my-progress and set the current user to be the new user. Any subsequent commands will update the information of this new user.

Example:   
`mp --new-user bob`

add tasks
---------
`mp tasks ${list of tasks}`

This command adds one or more tasks to the user. This is how you set the particular tasks that you want to track. You cannot "complete" a task unless you have first added it with this command. This is kind of like a very general daily TODO list, so this is just adding tasks to the list.

Example:   
`mp tasks read dance write guitar`

complete tasks
-------------
`mp complete ${task}`

Sets the task to completed for today.

Example:   
`mp complete read`

progress status
---------------
`mp status`

Outputs a progress report for the current user. This report will contain warnings and alerts based on how long it has been since you last completed a task.

Example:   
```shell
$ mp status

- - - Productivity Report for james - - -

ALERT!!! It has been 3 days since you completed "read"!

Good job! You completed the task "music" today.

```

change user
-----------
`mp --user ${name}`

Changes the current user.

TODOs
-----
- generate a chart of task history in the terminal
- generate a static website that is pretty(ish)
- handle properly tasks that are added after there is already a history
