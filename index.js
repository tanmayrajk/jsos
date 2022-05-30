#!/usr/bin/env node

import chalk from 'chalk'
import chalkAnimation from 'chalk-animation'
import inquirer from 'inquirer'
import gradient from 'gradient-string'
import { createSpinner } from 'nanospinner'
import pkg from 'inquirer'
const { registerPrompt } = pkg
import { readFile, writeFile } from "fs/promises"
import { unlink } from "node:fs"

const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms))

let config = {}

// makes config if not already there and updates the config object in the code
async function makeConfig() {
    try {
      const data = await readFile('config.json', { encoding: 'utf8' });
      if (data != {}) config = JSON.parse(data)
    } catch (err) {
        await writeFile('config.json', JSON.stringify(config));
    }
}

// shows shiny welcome text
async function welcome() {
    const rainbowTitle = chalkAnimation.rainbow('welcome to jsos! \n')
    await sleep()
    rainbowTitle.stop()
}

// give the user the choice to register, login, logout and terminate
async function firstChoice() {
    let choices = []
    if (config.user) choices.push("register", "login", "logout", "terminate")
    else choices.push("register", "login", "terminate")
    const answers = await inquirer.prompt({
        "name": "firstChoice",
        "type": "list",
        "message": "choose one ->",
        "choices": choices
    })
    
    return handleFirstChoice(answers.firstChoice)
}

// handles the output of their first choice
async function handleFirstChoice(answer) {
    const spinner = createSpinner('loading...').start()
    await sleep()

    if (answer === "register") {
        spinner.success({text: `choice: ${answer}`})
        register()
    }
    else if (answer === "login") {
        spinner.success({text: `choice: ${answer}`})
        login()
    }
    else if (answer === "logout") {
        spinner.success({text: `goodbye ${config.user}!`})
        unlink("config.json", (err) => console.log(err))
        process.exit(1)
    }
    else {
        let username
        if (config.user) username = config.user
        else username = "human"
        spinner.success({text: `goodbye ${username}!`})
        process.exit(1)
    }
}

// asks the user their username
async function userName() {
    const answers = await inquirer.prompt({
        "name": "userName",
        "type": "input",
        "message": "enter a username ->"
    })
    
    return answers.userName
}

// asks the user their password
async function passWord() {
    const answers = await inquirer.prompt({
        "name": "passWord",
        "type": "input",
        "message": "enter a password ->"
    })
    
    return answers.passWord
}

// registers the user
async function register() {
    let user = await userName()
    let pass = await passWord()
    config.user = user
    config.pass = pass
    await writeFile('config.json', JSON.stringify(config));
    await login(user, pass)
}

// logs in the user
async function login(registeredUser = null, registeredPass = null) {
    let data = await readFile('config.json', { encoding: 'utf8' });
    config = JSON.parse(data)
    let user = registeredUser || await userName()
    let pass = registeredPass || await passWord()
    const spinner = createSpinner('logging in...').start()
    await sleep()
    if (user === config.user && pass === config.pass) {
        spinner.success({text: "welcome home!"})
        process.exit(0)
    } 
    else if (user === config.user && pass != config.pass) {
        spinner.error({text: "your password is wrong!"})
        process.exit(1)
    }
    else if (user != config.user && pass === config.pass) {
        spinner.error({text: "your username is wrong!"})
        process.exit(1)
    }
    else {
        spinner.error({text: "you deserve to die in hell!"})
        process.exit(1)
    }
    
}

await makeConfig()
await welcome()
await firstChoice()