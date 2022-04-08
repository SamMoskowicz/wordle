const allowedWords = require("./client/allowedWords")
const getWordFromDate = require("./client/getWordFromDate")
const hiddenWords = require("./client/hiddenWords")
const sortedHiddenWords = require("./client/sortedHiddenWords")
const remainingHidden = sortedHiddenWords.slice()
const remainingAllowed = allowedWords.slice()

const displayBoard = document.getElementById("board")
const keyboard = document.getElementById("keyboard")
const remainingWords = document.getElementById("remaining-words")
const remainingWordsButton = document.getElementById("remaining-words-button")
const remainingWordsList = document.getElementById("remaining-words-list")
const hintButton = document.getElementById("hint-button")
const bestWordContainer = document.getElementById("best-word-container")
const gameContainer = document.getElementById("game-container")
const hardModeButton = document.getElementById("hard-mode-button")
const optionsButton = document.getElementById("options-button")

const keyboardLayout = ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
const letterToElement = new Array(26)

let loading = false

for (let i = 0; i < 3; i++) {
  const keyboardRow = document.createElement("div")
  keyboardRow.className = "keyboard-row"
  keyboard.append(keyboardRow)
  if (i == 1) {
    const empty = document.createElement("div")
    empty.className = "empty gray"
    keyboardRow.append(empty)
  }
  if (i == 2) {
    const enterButton = document.createElement("div")
    enterButton.className = "enter-button gray"
    enterButton.innerText = "ENTER"
    keyboardRow.append(enterButton)
  }
  for (const char of keyboardLayout[i]) {
    const keyboardButton = document.createElement("div")
    keyboardButton.className = "keyboard-button gray"
    keyboardButton.innerText = char.toUpperCase()
    keyboardRow.append(keyboardButton)
    letterToElement[char.charCodeAt(0) - "a".charCodeAt(0)] = keyboardButton
  }
  if (i == 1) {
    const empty = document.createElement("div")
    empty.className = "empty gray"
    keyboardRow.append(empty)
  }
  if (i == 2) {
    const deleteButton = document.createElement("div")
    deleteButton.className = "delete-button gray"
    deleteButton.innerText = "BACK"
    keyboardRow.append(deleteButton)
  }
}

function matchWords(guessWord, secretWord) {
  guessWord = guessWord.toLowerCase()
  // console.log("guessWord:", guessWord, "secretWord:", secretWord)
  let res = 0
  const cnt = new Array(26).fill(0)
  for (const char of secretWord)
    cnt[char.toLowerCase().charCodeAt(0) - "a".charCodeAt(0)]++
  for (let i = 0; i < 5; i++) {
    if (guessWord[i] == secretWord[i]) {
      res += Math.pow(3, i)
      cnt[guessWord[i].toLowerCase().charCodeAt(0) - "a".charCodeAt(0)]--
    }
  }
  for (let i = 0; i < 5; i++) {
    if (guessWord[i] == secretWord[i]) continue
    const letterValue =
      guessWord[i].toLowerCase().charCodeAt(0) - "a".charCodeAt(0)
    if (cnt[letterValue]) {
      res += Math.pow(3, i) * 2
      cnt[letterValue]--
    }
  }
  return res
}

function convertNumToColors(n) {
  const colors = new Array(5)
  const colorMap = ["black", "green", "yellow"]
  for (let i = 0; i < 5; i++) {
    colors[i] = colorMap[n % 3]
    n = Math.floor(n / 3)
  }
  return colors
}

function convertColorsToNum(colors) {
  const colorMap = { black: 0, green: 1, yello: 2 }
  let res = 0
  for (let i = 0; i < colors.length; i++)
    res += Math.pow(3, i) * colorMap[colors[i]]
  return res
}

function randInt(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}

function containsWord(
  word,
  words,
  startIndex = 0,
  endIndex = words.length - 1
) {
  word = word.toLowerCase()
  // console.log("searching for ", word)
  let l = startIndex,
    r = endIndex
  while (l <= r) {
    const mid = Math.floor((r + l) / 2)
    // console.log("r:", r, "l:", l, "mid:", mid, "words[mid]:", words[mid])
    if (word < words[mid]) r = mid - 1
    else l = mid + 1
  }
  // console.log(
  //   "word:",
  //   word,
  //   "l:",
  //   l,
  //   "r:",
  //   r,
  //   "words[l]:",
  //   words[l],
  //   "words[r]:",
  //   words[r]
  // )
  return r >= startIndex && words[r] === word
}

let currentToast
let toastTimeout

function removeToast() {
  if (!currentToast) return
  document.body.removeChild(currentToast)
  clearTimeout(toastTimeout)
  currentToast = null
}

function toastMessage(message, length) {
  const toastElement = document.createElement("div")
  toastElement.className = "toast"
  toastElement.innerText = message
  // toastElement.style.animationName = "fadeout"
  toastElement.style.animationDelay = length / 1000 - 0.25 + "s"
  toastElement.style.animationDuration = ".25s"
  document.body.append(toastElement)
  if (currentToast) removeToast
  currentToast = toastElement
  toastTimeout = setTimeout(() => {
    document.body.removeChild(toastElement)
    currentToast = null
  }, length)
}

// console.log("match raise with snout", matchWords("raise", "snout"))
// console.log("match raise with snout", matchWords("poynt", "snout"))

function getBoardElement(r, c) {
  const row = displayBoard.children[r]
  // console.log("r:", r, "c:", c, "el:", row.children[c])
  return row.children[c]
}

function letterValue(letter) {
  return letter.toLowerCase().charCodeAt(0) - "a".charCodeAt(0)
}

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/)
}

function swap(i, j, arr) {
  const tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
}

function updateWords(len, word, colorsCode, words, updatingAllowed, hard) {
  console.log("updating word:", word)
  console.log("word colorsCode:", colorsCode)
  let newLen = 0
  for (let i = 0; i < len; i++) {
    const currCode = matchWords(word, words[i])
    if (words[i] === "midst") {
      console.log("match words ", word, words[i] + ":", colorsCode)
    }
    if (currCode === colorsCode) swap(i, newLen++, words)
  }
  return newLen
}

function undoUpdate(len, prevLen, words) {
  for (let i = prevLen - 1; i >= 0; i--)
    if (words[i] <= words[len - 1]) swap(i, --len, words)
}

function shuffle(arr, startIndex = 0, endIndex = arr.length - 1) {
  for (let i = startIndex; i <= endIndex; i++) {
    const randomIndex = randInt(i, endIndex)
    swap(i, randomIndex, arr)
  }
}

function compareArrays(arr1, arr2) {
  for (let i = 0; i < arr1.length && i < arr2.length; i++) {
    if (arr1[i] < arr2[i]) return -1
    if (arr1[i] > arr2[i]) return 1
  }
  if (arr1.length < arr2.length) return -1
  if (arr1.length > arr2.length) return 1
  return 0
}

function estimateWordsScores(
  remainingAllowed,
  allowedIndex,
  remainingHidden,
  hiddenIndex
) {
  const res = []
  for (let i = allowedIndex; i < remainingAllowed.length; i++) {
    const cnt = new Array(243).fill(0)
    for (let j = hiddenIndex; j < remainingHidden.length; j++) {
      if (remainingAllowed[i] === remainingHidden[j]) continue
      const currMatch = matchWords(remainingAllowed[i], remainingHidden[j])
      cnt[currMatch]++
    }
    cnt.sort((a, b) => b - a)
    res.push([remainingAllowed[i], cnt])
  }
  shuffle(res)
  res.sort((a, b) => {
    if (compareArrays(a[1], b[1]) === 1) return 1
    else if (compareArrays(a[1], b[1]) === -1) return -1
    return 0
  })
  let currScore = -1
  let last = [Infinity]
  for (let i = 0; i < res.length; i++) {
    if (compareArrays(res[i][1], last) === -1) {
      currScore++
      last = res[i][1]
    }
    res[i][1].push(currScore)
  }
  // res.sort()
  return res
}

function estimateBest(
  allowedLen,
  remainingAllowed,
  hiddenLen,
  remainingHidden
) {
  let bestWord = ""
  let bestCnt = [Infinity]
  let sameCnt = 0
  if (hiddenLen <= 2) return remainingHidden[randInt(0, hiddenLen - 1)]
  for (let i = 0; i < allowedLen; i++) {
    const cnt = new Array(243).fill(0)
    for (let j = 0; j < hiddenLen; j++) {
      if (remainingAllowed[i] === remainingHidden[j]) continue
      const currMatch = matchWords(remainingAllowed[i], remainingHidden[j])
      cnt[currMatch]++
      if (cnt[currMatch] > bestCnt[0]) break
    }
    cnt.sort((a, b) => b - a)
    if (compareArrays(cnt, bestCnt) === -1) {
      bestCnt = cnt
      bestWord = remainingAllowed[i]
      sameCnt = 1
    } else if (compareArrays(cnt, bestCnt) === 0) {
      sameCnt++
      const rand = randInt(1, sameCnt)
      if (rand === 1) bestWord = remainingAllowed[i]
    }
  }
  // console.log("best word:", bestWord)
  // console.log("best count:", bestCnt)
  return bestWord
}

function getSomeRemainingWords(n, len, words) {
  const set = new Set()
  while (set.size < len && set.size < n) set.add(words[randInt(0, len - 1)])
  return [...set]
}

let difficulty = "easy"
let guesses = 0
let currCol = 0
let isPlaying = false
let isPaused = false
const currWord = []
const history = []
let allowedLen = remainingAllowed.length
let hiddenLen = remainingHidden.length
let secretWord
const letterColors = new Array(26).fill("gray")
const colorPred = { gray: 0, black: 1, yellow: 2, green: 3 }

function processInput(input) {
  if (isPaused) return
  if (loading) return
  if (input === "BACKSPACE" || input === "BACK") {
    if (currCol === 0) return
    currWord.pop()
    currCol--
    getBoardElement(guesses, currCol).innerText = ""
    return
  }
  if (input === "ENTER") {
    if (currCol < 5) return
    if (!containsWord(currWord.join(""), allowedWords)) {
      console.log("not in word list")
      toastMessage("NOT IN WORD LIST", 1500)
      return
    }
    if (
      difficulty === "hard" &&
      !containsWord(currWord.join(""), remainingAllowed, 0, allowedLen - 1)
    ) {
      console.log("word not allowed in hard mode")
      toastMessage("WORD DOES NOT MATCH PREVIOUS INPUT", 2500)
      return
    }
    const guessWord = currWord.join("").toLowerCase()
    const colorsCode = matchWords(guessWord, secretWord)
    if (colorsCode === 121) {
      for (let i = history.length - 1; i > 0; i--) {
        undoUpdate(history[i][0], history[i - 1][0], remainingHidden)
        undoUpdate(history[i][1], history[i - 1][1], remainingAllowed)
      }
      toastMessage("CONGRATULATIONS! YOU GUESSED THE WORD!", 1000000000)
      endGame()
      showGameOptions()
    }
    history.push([hiddenLen, allowedLen, guessWord])
    const colors = convertNumToColors(colorsCode)
    hiddenLen = updateWords(hiddenLen, guessWord, colorsCode, remainingHidden)
    allowedLen = updateWords(
      allowedLen,
      guessWord,
      colorsCode,
      remainingAllowed
    )
    console.log("remainig hidden words:", hiddenLen)
    console.log("remainig allowed words:", allowedLen)
    remainingWords.innerText = "Remainig Words that match: " + hiddenLen
    remainingWordsList.innerHTML = ""
    bestWordContainer.innerHTML = ""
    for (let i = 0; i < 5; i++) {
      getBoardElement(guesses, i).className = colors[i]
      if (
        colorPred[colors[i]] >
        colorPred[letterColors[letterValue(guessWord[i])]]
      ) {
        letterToElement[letterValue(guessWord[i])].className =
          "keyboard-button " + colors[i]
        letterColors[letterValue(guessWord[i])] = colors[i]
      }
    }
    guesses++
    currWord.length = 0
    currCol = 0
    if (guesses === 6) {
      for (let i = history.length - 1; i > 0; i--) {
        undoUpdate(history[i][0], history[i - 1][0], remainingHidden)
        undoUpdate(history[i][1], history[i - 1][1], remainingAllowed)
      }
      toastMessage(secretWord, 1000000000)
      endGame()
      showGameOptions()
    }
    return
  }
  if (currCol == 5) return
  currWord.push(input)
  getBoardElement(guesses, currCol).innerText = input
  currCol++
}

function processKeyboardInput(e) {
  if (loading) return
  const input = e.key.toLowerCase()
  if (input !== "enter" && input !== "backspace" && !isLetter(input)) return
  processInput(input.toUpperCase())
}

function processVirtualKeyboardInput(e) {
  if (loading) return
  const input = e.target.innerText
  processInput(input.toUpperCase())
}

function showSomeRemainingWords() {
  if (isPaused) return
  if (loading) return
  remainingWordsList.innerHTML = ""
  const words = getSomeRemainingWords(10, hiddenLen, remainingHidden)
  for (const word of words) {
    const li = document.createElement("li")
    li.className = "remaining-word"
    li.innerText = word.toUpperCase()
    remainingWordsList.append(li)
  }
}

function showLoader(el) {
  if (loading) return
  loading = true
  const loader = document.createElement("div")
  loader.className = "loader"
  el.append(loader)
  return loader
}

function showBestWord() {
  if (isPaused) return
  console.log("game container tab index:", gameContainer.tabIndex)
  // gameContainer.tabIndex = -1
  gameContainer.focus()
  // gameContainer.tabIndex = -1
  console.log("loading:", loading)
  if (loading) return
  if (bestWordContainer.innerHTML.length) return
  const loader = showLoader(bestWordContainer)
  setTimeout(() => {
    const bestWord =
      guesses === 0
        ? "raise"
        : estimateBest(allowedLen, remainingAllowed, hiddenLen, remainingHidden)
    bestWordContainer.innerText =
      "The estimated best word is: " + bestWord.toUpperCase()
    loading = false
  }, 0)
}

function endGame() {
  if (!isPlaying) return
  isPlaying = false
  keyboard.removeEventListener("click", processVirtualKeyboardInput)
  document.removeEventListener("keydown", processKeyboardInput)
  remainingWordsButton.removeEventListener("click", showSomeRemainingWords)
  hintButton.removeEventListener("click", showBestWord)
}

function startGame(mode, date) {
  console.log("stargin game...")
  console.log("is playing:", isPlaying)
  if (isPlaying) return
  console.log("continuing game...")
  isPlaying = true
  removeToast()
  for (const el of letterToElement) el.className = "keyboard-button gray"
  for (let i = 0; i < 26; i++)
    letterToElement[i].className = "keyboard-button gray"
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      getBoardElement(i, j).className = ""
      getBoardElement(i, j).innerText = ""
    }
  }
  guesses = 0
  letterColors.fill("gray")
  // let difficulty = "easy"
  currCol = 0
  currWord.length = 0
  history.length = 0
  historyIndex = -1
  allowedLen = remainingAllowed.length
  hiddenLen = remainingHidden.length
  secretWord =
    mode === "random"
      ? hiddenWords[randInt(0, hiddenWords.length - 1)]
      : getWordFromDate(date, hiddenWords)

  remainingWords.innerText = "Remainig words that match: " + hiddenLen

  keyboard.addEventListener("click", processVirtualKeyboardInput)
  document.addEventListener("keydown", processKeyboardInput)
  remainingWordsButton.addEventListener("click", showSomeRemainingWords)
  hintButton.addEventListener("click", showBestWord)
}

function pauseGame() {
  isPaused = true
}

function unpauseGame() {
  isPaused = false
}

let gameOptionsIsShown = false

function showGameOptions() {
  const blackElement = document.createElement("div")
  blackElement.style.width = "100vw"
  blackElement.style.height = "100vh"
  blackElement.style.position = "fixed"
  blackElement.style.top = "0px"
  blackElement.style.left = "0px"
  blackElement.style.backgroundColor = "rgba(0, 0, 0, .7)"
  document.body.append(blackElement)
  gameOptionsIsShown = true
  pauseGame()
  const gameOptions = document.createElement("div")
  gameOptions.className = "game-options-container"
  const cancelButton = document.createElement("button")
  cancelButton.className = "cancel-button"
  cancelButton.innerText = "X"
  gameOptions.append(cancelButton)

  const randomGameContainer = document.createElement("div")
  randomGameContainer.className = "game-option-container"
  gameOptions.append(randomGameContainer)

  const randomGame = document.createElement("input")
  randomGame.className = "random"
  randomGame.type = "checkbox"
  randomGame.className = "game-option-checkbox"
  randomGameContainer.append(randomGame)

  const randomGameText = document.createElement("div")
  randomGameText.innerText = "Play Random Word"
  randomGameText.class = "game-option-text"
  randomGameContainer.append(randomGameText)

  const dateGameContainer = document.createElement("div")
  dateGameContainer.className = "game-option-container"
  gameOptions.append(dateGameContainer)

  const dateGame = document.createElement("input")
  dateGame.className = "game-option-checkbox"
  dateGame.type = "checkbox"
  dateGame.checked = true
  dateGameContainer.append(dateGame)

  const dateGameText = document.createElement("div")
  dateGameText.innerText = "Play Word Of Specific Date"
  dateGameText.class = "game-option-text"
  dateGameContainer.append(dateGameText)

  const dateSelector = document.createElement("input")
  dateSelector.type = "date"
  dateSelector.setAttribute("required", true)
  dateSelector.value = new Date(Date.now()).toJSON().slice(0, 10)
  dateSelector.min = "2021-06-19"
  dateGameContainer.append(dateSelector)

  const playButton = document.createElement("button")
  playButton.className = "play-button"
  playButton.innerText = "Play"
  gameOptions.append(playButton)

  function onCheckbox(e) {
    console.log("e:", e.target)
    console.log(e.target.className)
    if (!e.target.classList.contains("game-option-checkbox")) return
    dateGame.checked = false
    randomGame.checked = false
    e.target.checked = true
  }

  function onCancel() {
    console.log("canceling")
    playButton.removeEventListener("click", onPlay)
    cancelButton.removeEventListener("click", onCancel)
    gameOptions.removeEventListener("click", onCheckbox)
    document.body.removeChild(gameOptions)
    unpauseGame()
    gameOptionsIsShown = false
    document.body.removeChild(blackElement)
  }
  function onPlay() {
    playButton.removeEventListener("click", onPlay)
    cancelButton.removeEventListener("click", onCancel)
    gameOptions.removeEventListener("click", onCheckbox)
    document.body.removeChild(gameOptions)
    console.log("date selector date:", dateSelector.value)
    const dateSelectorDate = new Date(dateSelector.value)
    console.log(dateSelectorDate.getTime())
    endGame()
    if (randomGame.checked) startGame("random", 0)
    else startGame("date", new Date(dateSelectorDate.getTime() + 100000000))
    unpauseGame()
    gameOptionsIsShown = false
    document.body.removeChild(blackElement)
  }

  playButton.addEventListener("click", onPlay)
  cancelButton.addEventListener("click", onCancel)
  gameOptions.addEventListener("click", onCheckbox)
  document.body.append(gameOptions)
}

hardModeButton.addEventListener("change", (e) => {
  if (e.target.checked) difficulty = "hard"
  else difficulty = "easy"
  console.log("difficulty:", difficulty)
})

optionsButton.addEventListener("click", () => {
  if (gameOptionsIsShown) return
  showGameOptions()
})

startGame("date", new Date(Date.now()))

showGameOptions()
