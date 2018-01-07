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
      })
  }
  completeTasks(tasks) {
    let today;
    if (this.chain.length) {
      const lastDay = this.chain[this.chain.length - 1]
      const lastDateString = lastDay.date
      const lastDate = new Date(lastDateString)
      const diff = differenceInCalendarDays(new Date(), lastDate)
      if (isToday(lastDate)) {
        /* modify existing "today" record */
        this.addTasksToDay(lastDay, tasks)
      } else if (diff > 1) {
        /* fill in gap, create and then modify today record */
        this.populateEmptyDays()
        today = newDayFactory(new Date())
        this.addTasksToDay(today, tasks)
        this.chain.push(today)
      } else {
        /* add new record for today */
        today = newDayFactory(new Date())
        this.addTasksToDay(today, tasks)
        this.chain.push(today)
      }
    } else {
      /* first record */
      today = newDayFactory(new Date())
      this.addTasksToDay(today, tasks)
      this.chain.push(today)
    }
    this.save()
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
          } else if (diff > 3) {
            console.log(`\n${green('Not bad!')} You completed the task "${task}" ${diff} days ago.`)
          } else if (diff > 5) {
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
    const lastDateString = this.chain[this.chain.length - 1].date
    const lastDate = new Date(lastDateString)
    const diff = differenceInCalendarDays(new Date(), lastDate)
    if (diff > 1) {
      let nextDay = lastDate
      for (let i = 0; i < diff - 1; i++) {
        nextDay = addDays(nextDay, 1)
        this.chain.push(newDayFactory(nextDay))
      }
    }
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
