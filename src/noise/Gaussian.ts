import * as tf from "@tensorflow/tfjs-node";
import { Interval, Duration } from "luxon";
import { Signal } from "../Signal";

export class Gaussian extends Signal {
	mean: number;
	stdDev: number;

	constructor(mean = 0.0, stdDev = 1.0) {
		super();
		this.mean = mean;
		this.stdDev = stdDev;
	}

	_sample(
		interval: Interval,
		granularity: Duration,
		dtype?: "float32" | "int32",
		seed?: number
	): tf.Tensor {
		return tf.randomNormal(
			[interval.splitBy(granularity).length],
			this.mean,
			this.stdDev,
			dtype,
			seed
		);
	}
}
