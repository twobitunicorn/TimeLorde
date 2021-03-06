import * as tf from "@tensorflow/tfjs-node";
import { assert } from "console";
import { Signal } from "../Signal.js";
import { Duration, Interval } from "luxon";

/**
 * Sinusoidal
 *
 * Represents a sinusoidal wave.
 */
export class Sinusoidal extends Signal {
	amplitude: number;
	period: Duration;
	offset: Duration;
	intercept: number;

	/**
	 * Creates an instance of sinusoidal.
	 * @param amplitude
	 * @param period
	 * @param [offset] The phase of the wave
	 * @param [shift] The vertical shift of the wave
	 */
	constructor(
		amplitude: number,
		period: Duration,
		offset: Duration = Duration.fromObject({ milliseconds: 0.0 }),
		intercept = 0.0
	) {
		assert(period.valueOf() > 0, "period must have some duration");

		super();
		this.amplitude = amplitude;
		this.period = period;
		this.offset = offset;
		this.intercept = intercept;
	}

	_sample(
		interval: Interval,
		granularity: Duration,
		dtype: "float32" | "int32" = "float32"
	): tf.Tensor {
		const count = interval.splitBy(granularity).length;
		const frequency = granularity.valueOf() / this.period.valueOf();
		const phase = this.offset.valueOf() / granularity.valueOf();

		return tf.add(
			tf.mul(
				tf.sin(
					tf.mul(
						tf.sub(
							tf.linspace(0, count - 1, count),
							tf.scalar(phase, dtype)
						),
						tf.scalar(frequency * 2 * Math.PI, dtype)
					)
				),
				tf.scalar(this.amplitude, dtype)
			),
			tf.scalar(this.intercept, dtype)
		);
	}
}
