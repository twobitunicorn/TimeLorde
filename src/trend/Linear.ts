import * as tf from "@tensorflow/tfjs-node";
import { assert } from "console";
import { Interval, Duration } from "luxon";
import { Signal } from "../Signal";

/**
 * Linear
 *
 * Represents a linear growth trend
 */
export class Linear extends Signal {
	gradient: number;
	duration: Duration;
	intercept: number;

	constructor(gradient: number, duration: Duration, intercept = 0.0) {
		assert(duration.valueOf() > 0, "durations must have some duration");

		super();
		this.gradient = gradient;
		this.duration = duration;
		this.intercept = intercept;
	}

	_sample(
		interval: Interval,
		granularity: Duration,
		dtype?: "float32" | "int32"
	): tf.Tensor {
		const count = interval.splitBy(granularity).length;
		const scale = granularity.valueOf() / this.duration.valueOf();

		return tf.add(
			tf.mul(
				tf.scalar(this.gradient, dtype),
				tf.mul(
					tf.linspace(0, count - 1, count),
					tf.scalar(scale, dtype)
				)
			),
			tf.scalar(this.intercept, dtype)
		);
	}
}
