// TFSA contribution-room calculator (tfsasimplified.ca).
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

function fmt0(n) {
  return "$" + Math.round(n).toLocaleString("en-CA");
}

function showError(msg) {
  var err = document.getElementById("calc-error");
  err.textContent = msg;
  err.hidden = false;
  document.getElementById("results").hidden = true;
}

function calculate(birthYear, residencyYear) {
  var turn18 = birthYear + 18;
  var firstYear = Math.max(turn18, 2009);
  // Room only starts building the year you became a resident with a valid
  // SIN, so newcomers start later than the year they turned 18.
  if (residencyYear) firstYear = Math.max(firstYear, residencyYear);
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
  var sub = "Born " + birthYear + " · turned 18 in " + turn18 +
    " · eligible from " + firstYear;
  if (residencyYear) sub += " · resident since " + residencyYear;
  document.getElementById("room-sub").textContent = sub;
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
}

function run() {
  // Only the birth year sets your room — month and day do not change the
  // number, so the button works as soon as a valid year is typed.
  var year = parseInt(document.getElementById("dob-year").value, 10);
  if (isNaN(year) || year < 1900 || year > LAST_YEAR) {
    showError("Please type your birth year (1900–2026).");
    return;
  }
  var resVal = document.getElementById("residency-year").value;
  var residencyYear = null;
  if (resVal !== "") {
    residencyYear = parseInt(resVal, 10);
    if (isNaN(residencyYear) || residencyYear < 1900 || residencyYear > LAST_YEAR) {
      showError("Please type the year you became a resident (1900–2026), or leave it blank.");
      return;
    }
  }
  calculate(year, residencyYear);
}

function maybeRun() {
  // Auto-run once a full 4-digit birth year is typed.
  var year = document.getElementById("dob-year").value;
  if (/^\d{4}$/.test(year)) run();
}

// ---------- TFSA growth calculator ----------

function growthRun(validate) {
  var err = document.getElementById("growth-error");
  var results = document.getElementById("growth-results");
  var start = parseFloat(document.getElementById("growth-start").value) || 0;
  var monthly = parseFloat(document.getElementById("growth-monthly").value) || 0;
  var retRaw = document.getElementById("growth-return").value;
  var years = parseInt(document.getElementById("growth-years").value, 10);
  if (retRaw === "" || retRaw === null) {
    // Nothing to work out yet — stay quiet until a return is typed.
    err.hidden = true;
    results.hidden = true;
    return;
  }
  var ret = parseFloat(retRaw);
  if (isNaN(ret) || ret < 0 || ret > 30 || start < 0 || monthly < 0) {
    if (!validate) {
      err.hidden = true;
      results.hidden = true;
      return;
    }
    err.textContent = "Please type an annual return between 0 and 30 (for example, 6 for 6% a year).";
    err.hidden = false;
    results.hidden = true;
    return;
  }
  // Monthly compounding: contributions at the end of each month.
  var r = ret / 100 / 12;
  var n = years * 12;
  var future;
  if (r === 0) {
    future = start + monthly * n;
  } else {
    var factor = Math.pow(1 + r, n);
    future = start * factor + monthly * ((factor - 1) / r);
  }
  var contributed = start + monthly * n;
  var growth = future - contributed;
  err.hidden = true;
  document.getElementById("growth-total").textContent = fmt0(future);
  document.getElementById("growth-sub").textContent =
    "After " + years + " years at " + ret + "% a year";
  var dl = document.getElementById("growth-rows");
  dl.innerHTML = "";
  var rows = [
    ["Total you put in", fmt0(contributed)],
    ["Growth", fmt0(growth)],
    ["Years", years]
  ];
  rows.forEach(function (pair) {
    var dt = document.createElement("dt");
    dt.textContent = pair[0];
    var dd = document.createElement("dd");
    dd.textContent = pair[1];
    dl.appendChild(dt);
    dl.appendChild(dd);
  });
  results.hidden = false;
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("calc-btn").addEventListener("click", run);
  document.getElementById("example-btn").addEventListener("click", function () {
    document.getElementById("dob-year").value = "1990";
    document.getElementById("residency-year").value = "";
    calculate(1990, null);
  });
  ["dob-year", "residency-year"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", maybeRun);
  });
  document.getElementById("growth-btn").addEventListener("click", function () {
    growthRun(true);
  });
  ["growth-start", "growth-monthly", "growth-return", "growth-years"].forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener("input", function () { growthRun(false); });
    el.addEventListener("change", function () { growthRun(false); });
  });
});
