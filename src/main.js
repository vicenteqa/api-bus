const fs = require("fs");
const pdf = require("pdf-parse-fork");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const source = path.join(__dirname, "../sources/e15-1.pdf");

let dataBuffer = fs.readFileSync(source);

axios.get("https://busgarraf.cat/es/lineas/").then(({ data }) => {
  const $ = cheerio.load(data);
  const stops = $("h2 + div ul")
    .text()
    .split("\n\n")
    .filter((element) => {
      if (
        element.toLowerCase().includes("maristany") &&
        element.toLowerCase().includes("gran via")
      )
        return element;
    });

  console.log(stops[0]);
});

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
      preFormattedSchedules.push(Number(element));
    else if (element.length === 3 || element.length === 4) {
      preFormattedSchedules.push(Number(element.slice(0, 2)));
      preFormattedSchedules.push(Number(element.slice(2, element.length)));
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
});
