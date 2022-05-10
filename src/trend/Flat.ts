import * as tf from "@tensorflow/tfjs-node";
import { Signal } from "../Signal";
import { Interval, Duration } from "luxon";

/**
 * Flat
 *
 * Represents a flat signal
 */
export class Flat extends Signal {
	value: number;

	constructor(value = 0.0) {
		super();

		this.value = value;
	}

	_sample(
		interval: Interval,
		granularity: Duration,
		dtype?: "float32" | "int32"
	): tf.Tensor {
		const count = interval.splitBy(granularity).length;
		return tf.fill([count], this.value, dtype);
	}
}
