const remainingAllowed = require("./client/allowedWords")
const remainingHidden = require("./client/sortedHiddenWords")

function sort0(allowedWords, secretWords) {
  const cnt = new Array(26)
  for (let i = 0; i < 26; i++) cnt[i] = new Array(6).fill(0)
  for (let i = 0; i < secretWords.length; i++) {
    for (let j = 0; j < 5; j++) {
      cnt[letterValue(secretWords[i][j])][5]++
      cnt[letterValue(secretWords[i][j])][j]++
    }
  }
  const indicies = new Array(allowedWords.length)
  for (let i = 0; i < allowedWords.length; i++)
    indicies[i] = [allowedWords[i], 1]
  for (let i = 0; i < allowedWords.length; i++) {
    for (let j = 0; j < 5; j++) {
      let curr = 0
      const val = letterValue(allowedWords[i][j])
      curr += (allowedWords.length - cnt[val][5]) ** 2 / allowedWords.length
      curr += cnt[val][j] ** 2 / allowedWords.length
      curr += (cnt[val][5] - cnt[val][j]) ** 2 / allowedWords.length
      indicies[i][2] *= curr
    }
  }
  allowedWords.sort((a, b) => a[1] - b[1])
  for (let i = 0; i < indicies.length; i++) allowedWords[i] = indicies[i]
}

const possibleLetters = new Array(5)
for (let i = 0; i < 5; i++) possibleLetters[i] = new Array(26).fill(true)

const possibleLettersCnt = new Array(26)
for (let i = 0; i < 26; i++) possibleLettersCnt[i] = [0, 5]

function letterValue(letter) {
  return letter.toLowerCase().charCodeAt(0) - "a".charCodeAt(0)
}

function updatePossible(word, colorsCode) {
  const cnt = new Array(26).fill(0)
  const blacks = []
  const greens = []
  const yellows = []
  for (let i = 0; i < 5; i++) {
    const currColor = colorsCode % 3
    colorsCode = Math.floor(colorsCode / 3)
    const val = letterValue(word[i])
    if (colorsCode > 0) cnt[val]++
    else {
      blacks.push(i)
      possibleLetters[i][val] = false
    }
    if (colorsCode === 1) {
      greens.push(i)
      for (let j = 0; j < 26; j++) if (j !== val) possibleLetters[i][j] = false
    }
    if (colorsCode === 2) {
      yellows.push(i)
      possibleLetters[i][val] = false
    }
  }
  for (let i = 0; i < 26; i++) {
    possibleLettersCnt[i][0] = Math.max(possibleLettersCnt[i][0], cnt[i])
    if (blacks.some((e) => letterValue(word[e]) === i))
      possibleLettersCnt[i][1] = Math.min(possibleLettersCnt[i][1], cnt[i])
  }
  for (const black of blacks) {
    if (!yellows.some((e) => letterValue(word[e]) === black)) {
      for (let i = 0; i < 5; i++) {
        if (!greens.includes(i)) possibleLetters[i][black] = false
      }
    }
  }
}

function hasNewInfo(word, colorsCode) {
  const cnt = new Array(26).fill(0)
  const blacks = []
  const greens = []
  const yellows = []
  canBeSecretWord = true
  for (let i = 0; i < 5; i++) {
    const currColor = colorsCode % 3
    colorsCode = Math.floor(colorsCode / 3)
    const val = letterValue(word[i])
    if (colorsCode > 0) {
      cnt[val]++
      if (!possibleLetters[i][val]) canBeSecretWord = false
    } else {
      blacks.push(i)
      possibleLetters[i][val] = false
    }
    if (colorsCode === 1) {
      greens.push(i)
      for (let j = 0; j < 26; j++) if (j !== val) possibleLetters[i][j] = false
    }
    if (colorsCode === 2) {
      yellows.push(i)
      possibleLetters[i][val] = false
    }
  }
  for (let i = 0; i < 26; i++) {
    if (cnt[i] > possibleLettersCnt[i][1] || cnt[i] < possibleLettersCnt[i][0])
      canBeSecretWord = false
    if (cnt[i] > possibleLettersCnt[i][0]) return true
    if (
      blacks.some((e) => letterValue(word[e]) === i) &&
      cnt[i] < possibleLettersCnt[i][1]
    )
      return true
  }
  for (const black of blacks) {
    if (!yellows.some((e) => letterValue(word[e]) === black)) {
      for (let i = 0; i < 5; i++) {
        if (!greens.includes(i) && possibleLetters[i][black]) return true
      }
    }
  }
  return canBeSecretWord
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
    const lv = letterValue(guessWord[i])
    if (cnt[lv]) {
      res += Math.pow(3, i) * 2
      cnt[lv]--
    }
  }
  return res
}

function randInt(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}

function swap(i, j, arr) {
  const tmp = arr[i]
  arr[i] = arr[j]
  arr[j] = tmp
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

function updateWords(len, word, colorsCode, words, updatingAllowed, hard) {
  // console.log("updating word:", word)
  let newLen = 0
  for (let i = 0; i < len; i++) {
    const currCode = matchWords(word, words[i])
    if ((hard && currCode === colorsCode) || hasNewInfo(word, colorsCode))
      swap(i, newLen++, words)
  }
  return newLen
}

function undoUpdate(len, prevLen, words) {
  for (let i = prevLen - 1; i >= 0; i--)
    if (words[i] <= words[len - 1]) swap(i, --len, words)
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
      if (cnt[currMatch] > bestCnt[0]) continue
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

function simulateGame(secretWord, hardMode, remainingAllowed, remainingHidden) {
  for (let i = 0; i < 5; i++) possibleLetters[i].fill(false)
  for (let i = 0; i < 26; i++) possibleLettersCnt[i] = [0, 5]
  let guesses = 0
  let allowedLen = remainingAllowed.length
  let hiddenLen = remainingHidden.length
  const history = []
  while (hiddenLen) {
    guesses++
    const currGuess =
      guesses === 1
        ? "raise"
        : estimateBest(allowedLen, remainingAllowed, hiddenLen, remainingHidden)
    const colorsCode = matchWords(currGuess, secretWord)
    history.push([allowedLen, hiddenLen])
    if (colorsCode === 121) {
      for (let i = history.length - 1; i > 0; i--) {
        undoUpdate(history[i][1], history[i - 1][1], remainingHidden)
        undoUpdate(history[i][0], history[i - 1][0], remainingAllowed)
      }
      return guesses
    }
    updatePossible(currGuess, colorsCode)
    hiddenLen = updateWords(hiddenLen, currGuess, colorsCode, remainingHidden)
    allowedLen = updateWords(
      allowedLen,
      currGuess,
      colorsCode,
      remainingAllowed,
      true
    )
    console.log(
      "curr guess:",
      currGuess,
      "guesses:",
      guesses,
      "hiddenLen:",
      hiddenLen
    )
  }
  for (let i = history.length - 1; i > 0; i--) {
    undoUpdate(history[i][1], history[i - 1][1], remainingHidden)
    undoUpdate(history[i][0], history[i - 1][0], remainingAllowed)
  }
  return -1
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return false
  return true
}

function simulateRandomGames(n) {
  const stats = new Array(20).fill(0)
  while (n--) {
    if (!isSorted(remainingHidden)) console.log("hidden words is not sorted")
    if (!isSorted(remainingAllowed)) console.log("allowed words is not sorted")
    const secretWord = remainingHidden[randInt(0, remainingHidden.length - 1)]
    const totalGuesses = simulateGame(
      secretWord,
      false,
      remainingAllowed,
      remainingHidden
    )
    console.log("secret word:", secretWord, "total guesses:", totalGuesses)
    stats[totalGuesses]++
  }
  return stats
}

function simulateAllWords(n = 1) {
  const stats = new Array(20).fill(0)
  while (n--) {
    for (let i = 0; i < remainingHidden.length; i++) {
      const secretWord = remainingHidden[i]
      const totalGuesses = simulateGame(
        secretWord,
        false,
        remainingAllowed,
        remainingHidden
      )
      console.log("secret word:", secretWord, "total guesses", totalGuesses)
      stats[totalGuesses]++
    }
  }
  return stats
}

const stats = simulateAllWords()

console.log("stats:", stats)

function calculateAverage(stats) {
  let sum = 0,
    total = 0

  for (let i = 0; i < stats.length; i++) {
    sum += stats[i] * i
    total += stats[i]
  }

  return sum / total
}

console.log("average:", calculateAverage(stats))
