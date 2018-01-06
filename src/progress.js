const { openOrCreate, readFile } = require('./diskUtils/index.js')
const { MainData } = require('./core/main.js')

/*
node progress --new-user james
mp tasks read write exercise compose
mp complete read
mp status
*/

const NEW_USER = '--new-user'
const NEW_TASKS = 'tasks'
const COMPLETE = 'complete'
const STATUS = 'status'

const mainFile = '../data/pg_main_data.json'

const [ pathToNode, pathToMain, command, ...args ] = process.argv

openOrCreate(mainFile, 'r')
  .then(() => readFile(mainFile))
  .then(function(data) {
    const dataString = data.toString()
    if (!dataString && command !== NEW_USER) {
      console.log('No data found! Intialize progress by adding a new user with the --new-user option')

    } else if (!dataString && command === NEW_USER) {
      const mainData = new MainData()
      const [ userName ] = args
      mainData.addUser(userName)
    } else {
      const options = JSON.parse(dataString)
      const mainData = new MainData(options)
      switch (command) {
        case NEW_TASKS:
          mainData.addTasks(args)
          break
        case COMPLETE:
          mainData.completeTasks(args)
          break
        case STATUS:
          mainData.checkStatus()
      }
    }
  })
  .catch(err => console.log(err))
