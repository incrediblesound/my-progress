const diskUtils = require('../diskUtils/index.js')
const differenceInCalendarDays = require('date-fns/difference_in_calendar_days')
const addDays = require('date-fns/add_days')
const isToday = require('date-fns/is_today')
const subDays = require('date-fns/sub_days')


const colors = require('colors/safe')
const yellow = colors.yellow
const red = colors.red
const green = colors.green
const bold = colors.bold

const isDaysAgoCommand = (str) => /\-\-days\-ago\=[0-9]+/.test(str)

/*
[
  {
    date: datestr,
    tasks: hashSet,
  }
]
*/

class UserChain {
  constructor(dataFilePath, userData) {
    this.userName = userData.name
    this.userTasks = userData.tasks
    this.dataFilePath = dataFilePath
  }
  initialize() {
    return diskUtils.readFile(this.dataFilePath)
      .then(data => {
        const dataString = data.toString()
        if (!dataString) {
          this.chain = []
        } else {
          this.chain = JSON.parse(dataString)
        }
        return this.populateEmptyDays()
      })
  }
  completeTasks(tasks) {
    let today;
    if (isDaysAgoCommand(tasks[0])){
      const [ daysAgo, ...taskList ] = tasks
      this.completePastTask(daysAgo, taskList)
    } else {
      const today = this.chain[this.chain.length - 1]
      this.addTasksToDay(today, tasks)
    }
    this.save()
  }
  completePastTask(daysAgoCommand, tasks) {
    const commandParts = daysAgoCommand.split('=')
    const daysAgo = parseInt(commandParts[1])
    const targetDay = subDays(new Date(), daysAgo)
    let found = false

    for (let i = this.chain.length - 1; i >= 0; i --) {
      const currentDay = this.chain[i]
      if (!differenceInCalendarDays(new Date(currentDay.date), targetDay)) {
        this.addTasksToDay(currentDay, tasks)
        found = true
        break
      }
    }
    if (!found) {
      console.log(`${red('ERROR')}: past day is before beginning of user history`)
    }
  }
  checkStatus() {
    if (!this.chain.length) {
      console.log('No history for this user')
    } else {
      console.log(`\n- - - Productivity Report for ${bold(this.userName)} - - -`)
      const today = new Date()
      const record = {}
      this.userTasks.forEach(task => {
        for (let i = this.chain.length - 1; i >= 0; i --) {
          const currentDay = this.chain[i]
          if (currentDay.tasks[task]) {
            record[task] = currentDay.date
            break
          }
        }
      })
      this.userTasks.forEach(task => {
        if (!record[task]) {
          console.log(`\nThere is no record of you ever completing the task "${task}"`)
        } else {
          const completed = new Date(record[task])
          const diff = differenceInCalendarDays(today, completed)
          if (!diff) {
            console.log(`\n${green('Good job!')} You completed the task "${task}" today.`)
          } else if (diff < 2) {
            console.log(`\nYou completed the task "${task}" yesterday.`)
          } else if (diff < 5) {
            console.log(`\n${yellow('WARNING')}: You haven't complete the task "${task}" in ${diff} days.`)
          } else {
            console.log(`\n${red('ALERT!!!')} It has been ${diff} days since you completed "${task}"!`)
          }
        }
      })
    }
    console.log('\n')
  }
  addTasksToDay(day, tasks) { /* MUTATION */
    tasks.forEach(task => {
      if (this.userTasks.indexOf(task) < 0) {
        throw new Error(`Task not registered: "${task}"`)
      } else {
        day.tasks[task] = true
      }
    })
  }
  mutateLastDayForTesting() {
    const lastDay = this.chain[this.chain.length - 1]
    const lastDate = new Date(lastDay.date)
    const newDate = subDays(lastDate, 3)
    lastDay.date = newDate.toDateString()
  }
  populateEmptyDays() {
    if (this.chain.length) {
      const lastDateString = this.chain[this.chain.length - 1].date
      const lastDate = new Date(lastDateString)
      const diff = differenceInCalendarDays(new Date(), lastDate)
      if (diff) {
        let nextDay = lastDate
        for (let i = 0; i < diff; i++) {
          nextDay = addDays(nextDay, 1)
          this.chain.push(newDayFactory(nextDay))
        }
      }
    } else {
      const today = newDayFactory(new Date())
      this.chain.push(today)
    }
    return this.save()
  }
  save() {
    const dataString = JSON.stringify(this.chain)
    diskUtils.create(this.dataFilePath, dataString)
  }
}

const newDayFactory = (date) => {
  return {
    date: date.toDateString(),
    tasks: {},
  }
}

module.exports = UserChain
