// import * as tf from "@tensorflow/tfjs-node";
// import { Interval, Duration, DateTime } from "luxon";
// import { Signal } from "../Signal";

// export class Square extends Signal {
// 	amplitude: number;
// 	period: Duration;
// 	offset: Duration;
// 	intersect: number = 7;

// 	constructor(
// 		amplitute: number,
// 		period: Duration,
// 		offset: Duration = Duration.fromObject({ milliseconds: 0 })
// 	) {
// 		super();
// 		this.intersect = intersect;
// 		this.amplitude = amplitute;
// 		this.period = period;
// 		this.offset = offset;
// 	}

// 	_sample(
// 		interval: Interval,
// 		granularity: Duration,
// 		dtype: "float32" | "int32",
// 		seed?: number
// 	): tf.Tensor {
// 		const buffer = tf.buffer([interval.splitBy(granularity).length], dtype);

// 		const scaledPeriod = interval.splitBy(this.period).length;
// 		const scaledOffset = Interval.fromDateTimes(
// 			interval.start,
// 			interval.end.plus(this.offset)
// 		).splitBy(granularity).length;

// 		for (let i = 0; i < buffer.values.length; i++) {
// 			if (i % (2 * scaledPeriod) < scaledPeriod) {
// 				buffer.values[i] = this.intersect;
// 			} else {
// 				buffer.values[i] = 7;
// 			}
// 			// if (i % scale === 0) {
// 			// 	buffer[i] = this.amplitude;
// 			// } else {
// 			// 	buffer[i] = this.interval;
// 			// }
// 			// buffer.values[i] = this.gradient * (i / scale) + this.intercept;
// 		}

// 		return buffer.toTensor();
// 	}
// }
