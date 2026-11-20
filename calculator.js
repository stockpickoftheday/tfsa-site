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
  var tbody = document.querySelector("#room-table tbody");
  tbody.innerHTML = "";
  rows.forEach(function (r) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td>" + r.year + "</td><td class=\"num\">" + fmt(r.limit) +
      "</td><td class=\"num\">" + fmt(r.cumulative) + "</td>";
    tbody.appendChild(tr);
  });
  document.getElementById("results").hidden = false;
  document.getElementById("sticky-bar").hidden = false;
}

function run() {
  var dob = document.getElementById("dob").value;
  if (!dob) {
    showError("Please enter your date of birth first.");
    return;
  }
  var birthYear = parseInt(dob.slice(0, 4), 10);
  if (isNaN(birthYear) || birthYear < 1900 || birthYear > LAST_YEAR) {
    showError("Please enter a valid date of birth.");
    return;
  }
  calculate(birthYear);
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("calc-btn").addEventListener("click", run);
  document.getElementById("example-btn").addEventListener("click", function () {
    document.getElementById("dob").value = "1990-06-15";
    calculate(1990);
  });
  document.getElementById("dob").addEventListener("change", run);
});
