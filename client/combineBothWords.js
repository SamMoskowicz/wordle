const allowedWords = require("./allowedWords")
const hiddenWords = require("./hiddenWords")
const sortedHiddenWords = require("./sortedHiddenWords")

const allWords = []
for (const word of allowedWords) allWords.push(word)
for (const word of hiddenWords) allWords.push(word)

allWords.sort()

// function hasDuplicate(sortedArr) {
//   for (let i = 1; i < sortedArr.length; i++)
//     if (sortedArr[i] === sortedArr[i - 1]) return true
//   return false
// }

// console.log("has duplicate", hasDuplicate(allWords))

const fs = require("fs")
fs.writeFileSync(
  __dirname + "/allowedWords2.js",
  "const allowedWords = [\n" +
    allWords.map((word) => '"' + word + '"').join(",\n") +
    "\n]\n\nmodule.exports = allowedWords\n"
)
