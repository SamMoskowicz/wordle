const words = require("./hiddenWords")
const now = new Date(Date.now())

function getWordFromDate(date, words) {
  const beginning = new Date(2021, 5, 19, 0, 0, 0, 0)
  const diff =
    (date.setHours("0", "0", "0", "0") -
      beginning.setHours("0", "0", "0", "0")) /
    864e5
  return words[diff % words.length]
}

const todaysWord = getWordFromDate(now, words)

module.exports = getWordFromDate

console.log("today's word:", todaysWord)
