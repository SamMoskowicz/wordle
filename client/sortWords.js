const fs = require("fs")

const hiddenWords = require("./hiddenWords")

hiddenWords.sort()

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return false
  return true
}

fs.writeFileSync(
  __dirname + "/sortedHiddenWords.js",
  "const hiddenWords = [\n" +
    hiddenWords.map((word) => '"' + word + '"').join(",\n") +
    "\n]\n\nmodule.exports = hiddneWords\n"
)
