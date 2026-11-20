// TFSA contribution-room calculator (tfsaguide.ca).
// Annual TFSA dollar limits, 2009-2026 (Canada Revenue Agency).
// Runs entirely in the browser: nothing you type leaves your computer.
var TFSA_LIMITS = {
  2009: 5000, 2010: 5000, 2011: 5000, 2012: 5000,
  2013: 5500, 2014: 5500, 2015: 10000,
  2016: 5500, 2017: 5500, 2018: 5500,
  2019: 6000, 2020: 6000, 2021: 6000, 2022: 6000,
  2023: 6500, 2024: 7000, 2025: 7000, 2026: 7000
};
var LAST_YEAR = 2026;

function fmt(n) {
  return "$" + n.toLocaleString("en-CA");
}

function showError(msg) {
  var err = document.getElementById("calc-error");
  err.textContent = msg;
  err.hidden = false;
  document.getElementById("results").hidden = true;
  document.getElementById("sticky-bar").hidden = true;
}

function calculate(birthYear) {
  var turn18 = birthYear + 18;
  var firstYear = Math.max(turn18, 2009);
  if (firstYear > LAST_YEAR) {
    showError("You turn 18 in " + turn18 + ", so your TFSA room starts in " +
      firstYear + ". The TFSA limit for " + firstYear +
      " has not been published yet — check back, or come back in " + firstYear + ".");
    return;
  }
  var total = 0;
  var rows = [];
  for (var y = firstYear; y <= LAST_YEAR; y++) {
    total += TFSA_LIMITS[y];
    rows.push({ year: y, limit: TFSA_LIMITS[y], cumulative: total });
  }
  document.getElementById("calc-error").hidden = true;
  document.getElementById("room-total").textContent = fmt(total);
  document.getElementById("sticky-total").textContent = fmt(total);
  document.getElementById("room-sub").textContent =
    "Born " + birthYear + " · turned 18 in " + turn18 +
    " · eligible from " + firstYear;
  var dl = document.getElementById("room-rows");
  dl.innerHTML = "";
  var summary = [
    ["First eligible year", firstYear],
    ["Years of room", rows.length],
    ["2026 limit", fmt(TFSA_LIMITS[LAST_YEAR])]
  ];
  summary.forEach(function (pair) {
    var dt = document.createElement("dt");
    dt.textContent = pair[0];
    var dd = document.createElement("dd");
    dd.textContent = pair[1];
    dl.appendChild(dt);
    dl.appendChild(dd);
  });
  document.getElementById("results").hidden = false;
  document.getElementById("sticky-bar").hidden = false;
}

function run() {
  // Only the birth year sets your room — month and day do not change the
  // number, so the button works as soon as a valid year is typed.
  var year = parseInt(document.getElementById("dob-year").value, 10);
  if (isNaN(year) || year < 1900 || year > LAST_YEAR) {
    showError("Please type your birth year (1900–2026).");
    return;
  }
  calculate(year);
}

function maybeRun() {
  var year = document.getElementById("dob-year").value;
  var month = document.getElementById("dob-month").value;
  var day = document.getElementById("dob-day").value;
  if (year && month && day) run();
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("calc-btn").addEventListener("click", run);
  document.getElementById("example-btn").addEventListener("click", function () {
    document.getElementById("dob-day").value = "15";
    document.getElementById("dob-month").value = "6";
    document.getElementById("dob-year").value = "1990";
    calculate(1990);
  });
  ["dob-day", "dob-month", "dob-year"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", maybeRun);
  });
});
