const fs = require("fs");
const pdf = require("pdf-parse-fork");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const source = path.join(__dirname, "../sources/e15-1.pdf");

let dataBuffer = fs.readFileSync(source);

async function getBusStops() {
  try {
    const response = await axios.get("https://busgarraf.cat/es/lineas/");
    const $ = cheerio.load(response.data);
    const stops = $("h2 + div ul")
      .text()
      .split("\n\n")
      .filter((element) => {
        const elementInLowerCase = element.toLowerCase();
        if (
          elementInLowerCase.includes("maristany") &&
          elementInLowerCase.includes("gran via")
        )
          return element;
      });
    return stops[0].split("\n");
  } catch (error) {
    console.error(error);
  }
}

getBusStops().then((busStops) => console.log(busStops.length));

pdf(dataBuffer).then(function (data) {
  const pdfText = data.text;

  const regex = /\s+/g;

  const unFormattedSchedules = pdfText
    .replace(regex, "")
    .split("Elcumplim")[0]
    .split("egat")[2];

  const preFormattedSchedules = [];

  const splittedUnformattedSchedules = unFormattedSchedules.split(":");

  let count = 0;
  splittedUnformattedSchedules.map((element) => {
    if (element.length === 1 || element.length === 2)
      preFormattedSchedules.push(element);
    else if (element.length === 3 || element.length === 4) {
      preFormattedSchedules.push(element.slice(0, 2));
      preFormattedSchedules.push(element.slice(2, element.length));
    }
  });

  const formattedSchedules = [];
  let i = 0;
  while (i < preFormattedSchedules.length) {
    formattedSchedules.push(
      preFormattedSchedules[i] + ":" + preFormattedSchedules[i + 1]
    );
    i = i + 2;
  }

  const timetablesToBarcelona = [];
  const timetablesToVilanova = [];

  i = 0;
  while (i < formattedSchedules.length) {
    let j = 0;

    while (j < 11) {
      timetablesToBarcelona.push(formattedSchedules[j + i]);
      j++;
    }
    i = i + 22;
  }

  i = 11;
  while (i < formattedSchedules.length) {
    let j = 0;

    while (j < 11) {
      timetablesToVilanova.push(formattedSchedules[j + i]);
      j++;
    }
    i = i + 22;
  }

  console.log(timetablesToVilanova);
});
