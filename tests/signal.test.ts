import { DateTime, Interval, Duration } from "luxon";
import { Flat, Linear, Exponential } from "../src/trend";

import { toBeDeepCloseTo } from "jest-matcher-deep-close-to";
expect.extend({ toBeDeepCloseTo });

describe("signals", () => {
	const week = Interval.fromDateTimes(
		DateTime.fromISO("2022-03-27"),
		DateTime.fromISO("2022-04-03")
	);
	const month = Interval.fromDateTimes(
		DateTime.fromISO("2022-03-03"),
		DateTime.fromISO("2022-04-03")
	);

	test("a basic flat signal", async () => {
		const signal = new Flat(9);
		const samples = signal.sample(week, Duration.fromObject({ hours: 36 }));
		expect(samples).toEqual([9, 9, 9, 9, 9]);
	});

	test("a basic linear signal", async () => {
		const signal = new Linear(1, Duration.fromObject({ months: 2 }));
		const samples = signal.sample(month, Duration.fromObject({ days: 7 }));

		expect(samples).toBeDeepCloseTo([
			0, 0.1111111119389534, 0.2222222238779068, 0.3333333432674408,
			0.4444444477558136
		]);
	});

	test("another basic linear signal", async () => {
		const signal = new Linear(1, Duration.fromObject({ days: 1 }));
		const samples = signal.sample(week, Duration.fromObject({ hours: 12 }));
		expect(samples).toEqual([
			0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5
		]);
	});

	test("just one more basic linear signal", async () => {
		const signal = new Linear(1, Duration.fromObject({ days: 1 }));
		const samples = signal.sample(week, Duration.fromObject({ hours: 36 }));
		expect(samples).toEqual([0, 1, 2, 3, 4]);
	});

	test("basic addition between flat and linear signals", async () => {
		const signal = new Linear(1, Duration.fromObject({ months: 2 })).add(
			new Flat(9)
		);

		const samples = signal.sample(month, Duration.fromObject({ days: 7 }));
		expect(samples).toBeDeepCloseTo([
			9, 9.1111111119389534, 9.2222222238779068, 9.3333333432674408,
			9.4444444477558136
		]);
	});

	test("a basic check of a classic exponential signal", async () => {
		const signal = new Exponential(2, Duration.fromObject({ days: 1 }));
		const samples = signal.sample(week, Duration.fromObject({ days: 1 }));
		expect(samples).toEqual([1, 2, 4, 8, 16, 32, 64]);
	});

	test("a quick check on setting the asymptote", async () => {
		const signal = new Exponential(2, Duration.fromObject({ days: 1 }), 7);
		const samples = signal.sample(week, Duration.fromObject({ days: 1 }));
		expect(samples).toEqual([8, 9, 11, 15, 23, 39, 71]);
	});

	test("another check of an exponential signal", async () => {
		const signal = new Exponential(2, Duration.fromObject({ days: 7 }));
		const samples = signal.sample(week, Duration.fromObject({ days: 1 }));
		expect(samples).toBeDeepCloseTo([
			1, 1.1040894985198975, 1.2190136909484863, 1.3459001779556274,
			1.4859943389892578, 1.640670657157898, 1.8114473819732666
		]);
	});
});
