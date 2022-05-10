import * as tf from "@tensorflow/tfjs-node";
import { Interval, Duration } from "luxon";
import { Signal } from "../Signal";

export class Red extends Signal {
	mean: number;
	stdDev: number;
	correlation: number;

	constructor(mean = 0.0, stdDev = 1.0, correlation = 0.5) {
		super();
		this.mean = mean;
		this.stdDev = stdDev;
		this.correlation = correlation;
	}

	_sample(
		interval: Interval,
		granularity: Duration,
		dtype?: "float32" | "int32",
		seed?: number
	): tf.Tensor {
		const count = interval.splitBy(granularity).length;
		const buffer = tf.buffer([count], dtype);

		const whiteNoise = tf.randomNormal(
			[count],
			this.mean,
			this.stdDev,
			dtype,
			seed
		);

		buffer.values[0] = whiteNoise.bufferSync().values[0];
		for (let i = 1; i < buffer.values.length; i++) {
			buffer.values[i] =
				this.correlation * buffer.values[i - 1] +
				Math.sqrt(1 - this.correlation * this.correlation) *
					whiteNoise.bufferSync().values[i];
		}
		return buffer.toTensor();
	}
}
