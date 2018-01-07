const diskUtils = require('../diskUtils/index.js')
const UserChain = require('./chain.js')

const PREFIX = '/../data/'
const mainFile = '/../data/pg_main_data.json'
const getUserFilePath = (pathToSrc, name) => `${pathToSrc}${PREFIX}${name}_pg_data.json`

class MainData {
  constructor(data){
    this.pathToSrc = data.pathToSrc
    this.data = {
      currentUser: data.currentUser || null,
      users: data.users || [],
    }
  }
  changeUser(name) {
    const { users } = this.data
    const exists = !!users.find(user => user.name === name)
    if (!exists) {
      console.log(`There is not user "${name}"`)
    } else {
      this.data.currentUser = name
      this.save()
    }
  }
  addUser(name) {
    const { users } = this.data
    const exists = !!users.find(user => user.name === name)
    const hasSpaces = /\s/.test(name)
    if (exists) {
      console.log('A user with this name already exists')
    } else if (hasSpaces) {
      console.log('Username cannot contain spaces')
    } else {
      const dataFilePath = getUserFilePath(this.pathToSrc, name)
      diskUtils.create(dataFilePath).then(() => {
        users.push({
          name,
          dataFilePath,
          tasks: [],
        })
        this.data.currentUser = name
        this.save()
      })
    }
  }
  save() {
    const data = JSON.stringify(this.data)
    diskUtils.create(`${this.pathToSrc}${mainFile}`, data)
  }
  addTasks(tasks) {
    const { users } = this.data
    const userData = users.find(user => user.name === this.data.currentUser)

    if (!userData) {
      console.log('No current user or user data not found')

    } else {
      tasks.forEach(task => {
        const hasTask = !!userData.tasks.find(t => t === task)
        if (!hasTask) {
          userData.tasks.push(task)
        }
      })
      this.save()
    }
  }
  getUserChain() {
    const { users } = this.data
    const userData = users.find(user => user.name === this.data.currentUser)
    const dataFilePath = getUserFilePath(this.pathToSrc, userData.name)

    return new UserChain(dataFilePath, userData)
  }
  completeTasks(tasks) {
    const userChain = this.getUserChain()
    userChain.initialize().then(() => {
      userChain.completeTasks(tasks)
    })
  }
  checkStatus() {
    const userChain = this.getUserChain()
    userChain.initialize().then(() => {
      userChain.checkStatus()
    })
  }
}

module.exports = {
  MainData,
}
