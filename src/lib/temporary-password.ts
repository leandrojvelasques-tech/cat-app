import crypto from "crypto"

export function generateTemporaryPassword() {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lowercase = "abcdefghijkmnopqrstuvwxyz"
  const numbers = "23456789"
  const allCharacters = `${uppercase}${lowercase}${numbers}`
  const passwordCharacters = [
    uppercase[crypto.randomInt(uppercase.length)],
    lowercase[crypto.randomInt(lowercase.length)],
    numbers[crypto.randomInt(numbers.length)],
    ...Array.from({ length: 9 }, () => allCharacters[crypto.randomInt(allCharacters.length)]),
  ]

  for (let index = passwordCharacters.length - 1; index > 0; index--) {
    const swapIndex = crypto.randomInt(index + 1)
    const currentCharacter = passwordCharacters[index]
    passwordCharacters[index] = passwordCharacters[swapIndex]
    passwordCharacters[swapIndex] = currentCharacter
  }

  return passwordCharacters.join("")
}
