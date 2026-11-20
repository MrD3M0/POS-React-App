import { describe, expect, it } from "vitest";
import {
  bsWeekdayOf,
  dedupeBsDates,
  enumerateBsDateRange,
  filterBsDatesByWeekdays,
} from "./bs-date-range";

// Anchors from the conversion table: BS 2001-01-01 === AD 1944-04-13
// (a Thursday). BS 2001 has 31 days in month 1 and month 2 starts AD 1944-05-14.

describe("bsWeekdayOf", () => {
  it("maps BS 2001-01-01 to Thursday (AD 1944-04-13)", () => {
    expect(bsWeekdayOf("2001-01-01")).toBe(4);
  });

  it("maps BS 2001-01-03 to Saturday (AD 1944-04-15)", () => {
    expect(bsWeekdayOf("2001-01-03")).toBe(6);
  });

  it("stays consistent across a month boundary", () => {
    // BS 2001-01-31 === AD 1944-05-13 (Saturday), 02-01 === 1944-05-14 (Sunday)
    expect(bsWeekdayOf("2001-01-31")).toBe(6);
    expect(bsWeekdayOf("2001-02-01")).toBe(0);
  });

  it("throws on malformed or impossible BS dates", () => {
    expect(() => bsWeekdayOf("2001-13-01")).toThrow(RangeError);
    expect(() => bsWeekdayOf("not-a-date")).toThrow(RangeError);
    expect(() => bsWeekdayOf("2001-01-32")).toThrow(RangeError);
  });
});

describe("enumerateBsDateRange", () => {
  it("returns a single date when from equals to", () => {
    expect(enumerateBsDateRange("2081-05-14", "2081-05-14")).toEqual(["2081-05-14"]);
  });

  it("crosses BS month boundaries using the real month lengths", () => {
    expect(enumerateBsDateRange("2001-01-30", "2001-02-02")).toEqual([
      "2001-01-30",
      "2001-01-31",
      "2001-02-01",
      "2001-02-02",
    ]);
  });

  it("enumerates a full BS year (2081 has 366 days)", () => {
    const year = enumerateBsDateRange("2081-01-01", "2081-12-31");
    expect(year.length).toBe(366);
    expect(year[0]).toBe("2081-01-01");
    expect(year[365]).toBe("2081-12-31");
  });

  it("returns dates in strictly ascending order", () => {
    const dates = enumerateBsDateRange("2081-01-01", "2081-03-15");
    for (let i = 1; i < dates.length; i += 1) {
      expect(dates[i]! > dates[i - 1]!).toBe(true);
    }
  });

  it("throws when toBs is before fromBs", () => {
    expect(() => enumerateBsDateRange("2081-05-10", "2081-05-09")).toThrow(RangeError);
  });

  it("throws on invalid endpoints", () => {
    expect(() => enumerateBsDateRange("2081-01-01", "2081-00-10")).toThrow(RangeError);
  });
});

describe("filterBsDatesByWeekdays", () => {
  it("keeps only Saturdays of BS 2001-01 (5 of them: 3, 10, 17, 24, 31)", () => {
    const january = enumerateBsDateRange("2001-01-01", "2001-01-31");
    expect(filterBsDatesByWeekdays(january, [6])).toEqual([
      "2001-01-03",
      "2001-01-10",
      "2001-01-17",
      "2001-01-24",
      "2001-01-31",
    ]);
  });

  it("supports multiple weekdays at once", () => {
    const week = enumerateBsDateRange("2001-01-01", "2001-01-07");
    // Jan 1 is a Thursday → Saturday is Jan 3, Sunday is Jan 4.
    const satAndSun = filterBsDatesByWeekdays(week, [0, 6]);
    expect(satAndSun).toEqual(["2001-01-03", "2001-01-04"]);
  });

  it("returns nothing when no weekday is selected", () => {
    const january = enumerateBsDateRange("2001-01-01", "2001-01-31");
    expect(filterBsDatesByWeekdays(january, [])).toEqual([]);
  });
});

describe("dedupeBsDates", () => {
  it("removes duplicates and sorts ascending", () => {
    expect(dedupeBsDates(["2081-02-02", "2081-01-01", "2081-02-02"])).toEqual([
      "2081-01-01",
      "2081-02-02",
    ]);
  });

  it("keeps a single date untouched", () => {
    expect(dedupeBsDates(["2081-05-14"])).toEqual(["2081-05-14"]);
  });
});
