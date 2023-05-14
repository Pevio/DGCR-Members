import axios from "axios"
import dayjs from "dayjs"
import fs from "fs";

// Top Header Row
const thisYear = dayjs().get("year")
let resultText = "Username,Profile ID,DGCR Member Page,"
for (let i = 2007; i <= thisYear; i++) {
  resultText += `${i},`
}
resultText += "Total Reviews\n"

const dateStart = "<td align=\"center\">\n"
for (let i = 1; i <= 20; i++) {
  // Get the user page
  const url = `https://www.dgcoursereview.com/profile.php?id=${i}`
  const response = await axios.get(url)
  const data = response.data;

  // username, and make sure user is real
  const usernameStart = data.indexOf("<title>")
  if (data.substring(usernameStart + 7, usernameStart + 30) === "Disc Golf Course Review") continue;
  let username = ""
  while (true) {
    const nextChar = data[usernameStart + 7 + username.length]
    if (nextChar === "'") break;
    username += nextChar
  }

  // Make sure the user has at least 1 review
  const totalReviewStart = data.indexOf("<strong>Reviews:</strong>")
  let totalReviewText = ""
  while (true) {
    const nextChar = data[totalReviewStart + 26 + totalReviewText.length]
    if (nextChar === "'") break;
    totalReviewText += nextChar
  }
  const totalReviews = Number.parseInt(totalReviewText)
  if (totalReviews === 0) continue;
  
  const yearCounts = Array(17).fill(0) // number of reviews per year

  // Review indexes
  const reviewStart = data.indexOf("Review Date")
  const reviewEnd = data.indexOf("<td>Favorite</td>")
  var regex = /<td align="center">/gi, result, indices = [];
  while ( (result = regex.exec(data)) ) {
      indices.push(result.index);
  }
  // Review dates
  indices.forEach((strIndex, arrIndex) => {
    if (strIndex > reviewStart && strIndex < reviewEnd && arrIndex % 3 === 0) {
      let text = "";
      let currentIndex = strIndex + dateStart.length
      while (true) {
        if (data[currentIndex] === " ") {
          yearCounts[dayjs(text).year() - 2007] += 1;
          break;
        }
        text += data[currentIndex]
        currentIndex += 1;
      }
    }
  })

  // Compile results
  let rowText = `${username},${i},${url},`
  yearCounts.forEach((count) => {
    rowText += `${count},`
  })
  rowText += String(totalReviews)
  resultText += rowText + "\n"
}

fs.writeFile("./output.txt", resultText, (e) => {});
