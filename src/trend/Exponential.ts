import * as tf from "@tensorflow/tfjs-node";
import { Signal } from "../Signal.js";
import { Interval, Duration } from "luxon";

/**
 * Exponential
 *
 * Represents an exponential trend
 */
export class Exponential extends Signal {
	factor: number;
	duration: Duration;
	asymptote: number;

	constructor(factor: number, duration: Duration, asymptote = 0.0) {
		super();

		this.factor = factor;
		this.duration = duration;
		this.asymptote = asymptote;
	}

	_sample(
		interval: Interval,
		granularity: Duration,
		dtype?: "float32" | "int32"
	): tf.Tensor {
		const count = interval.splitBy(granularity).length;
		const scale = granularity.valueOf() / this.duration.valueOf();

		return tf.add(
			tf.pow(
				tf.mul(
					tf.linspace(0, count - 1, count),
					tf.scalar(scale, dtype)
				),
				tf.scalar(this.factor, dtype)
			),
			tf.scalar(this.asymptote, dtype)
		);
	}
}
