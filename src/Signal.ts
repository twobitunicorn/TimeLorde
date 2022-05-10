import * as tf from "@tensorflow/tfjs-node";
import { assert } from "console";
import { Duration, Interval, DateTime } from "luxon";

/**
 * Sample
 *
 * Represents what is returned from the results of sample
 */
export interface Sample {
	date: DateTime;
	value: number;
}

/**
 * Signal
 *
 * An abstract class for all signals to subclass.
 */
export abstract class Signal {
	add(signal: Signal): Signal {
		return new Composite(this, signal, tf.add);
	}

	mul(signal: Signal): Signal {
		return new Composite(this, signal, tf.mul);
	}

	abstract _sample(
		interval: Interval,
		granularity: Duration,
		dtype: "float32" | "int32",
		seed?: number
	): tf.Tensor;

	sample(
		interval: Interval,
		granularity: Duration,
		dtype: "float32" | "int32" = "float32",
		seed?: number
	): Array<Sample> {
		assert(
			!interval.isEmpty(),
			"Must provide an interval with some duration of time"
		);
		assert(
			granularity.valueOf() <= interval.toDuration().valueOf(),
			"Must provide a granularity of at least the duration of the interval"
		);
		// 👆 is implied by 👇
		assert(
			(interval.toDuration().valueOf() / granularity.valueOf()) % 1 === 0,
			"Must provide a granularity that is fitted to the interval"
		);

		const samples = this._sample(
			interval,
			granularity,
			dtype,
			seed
		).arraySync() as number[];

		const starts = interval.splitBy(granularity).map((i) => i.start);
		assert(
			starts.length === samples.length,
			"shape of samples and interval do not match"
		);
		return samples.map((sample, i) => {
			return { date: starts[i], value: sample };
		});
	}
}

/**
 * Composite
 *
 * Represents a either an add or multiply relationship between two signals.
 * This is an amazing example of a Composite Pattrn.
 */
class Composite extends Signal {
	private a: Signal;
	private b: Signal;
	private operator: <T extends tf.Tensor<tf.Rank>>(
		a: tf.Tensor<tf.Rank>,
		b: tf.Tensor<tf.Rank>
	) => T;

	constructor(
		a: Signal,
		b: Signal,
		operator: <T extends tf.Tensor<tf.Rank>>(
			a: tf.Tensor<tf.Rank>,
			b: tf.Tensor<tf.Rank>
		) => T
	) {
		super();
		this.a = a;
		this.b = b;
		this.operator = operator;
	}

	_sample(
		interval: Interval,
		granularity: Duration,
		dtype: "float32" | "int32",
		seed?: number
	): tf.Tensor {
		return this.operator(
			this.a._sample(interval, granularity, dtype, seed),
			this.b._sample(interval, granularity, dtype, seed)
		);
	}
}
