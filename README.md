![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/cool_image.png)

# Time Lorde

Creating time series for demos or testing purposes can be challenging. The `timelorde` library solves this problem for you. Using `Luxon` dates as native units of the `x` axis makes it easy to produce signals that work over arbitrary intervals of time. The library makes it convenient to produce various time series with `trends`, `seasonality`, and `noise`.

![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/intro_graph.png)

## Installing / Getting started

It is easy to get up and running. You must add it into your `javascript` or `typescript` project.

### pnpm

```shell
pnpm add timelorde
```

### yarn

```shell
yarn install timelorde
```

### npm

```shell
npm install timelorde
```

This should install `timelorde` into your project.

## Luxon

This library makes use of the [`Luxon`](https://moment.github.io/luxon) time and date library. This excellent library has three primary types that we use in this project: the `DateTime` type, the `Duration` type, and the `Interval` type. The `DateTime` is an immutable data structure that represents a specific date and accompanying methods. The `Duration` type represents a period of time such as 2 months or 1 day. The `Interval` type is an object representing a half-open interval of time where each endpoint is a `DateTime` object. The `Luxon` library also includes various types to help with the complexity of time zones. Please check out their documentation [here](https://moment.github.io/luxon/api-docs/)

If you do not already use the `luxon` library you can import the needed types from `timelorde/luxon`.

```
import { Interval, DateTime, Duration,  } from "timelorde/luxon";
```

## Developing

With a bit of understanding how to create the basic `Luxon` types we can start using our library. We have three major types of signals:

-   trend
-   seasonality
-   noise

Each of the signal types implement a `sample` method that will sample over an `Interval` instance and a fixed `Duration` that represents the granularity of the sampling. For example, using the type `Linear` with the formal constructor

```ts
Linear(gradient: number, duration: Duration, intercept = 0.0)
```

we can create a linear trend that will climb at the rate of the `gradient` over the `duration` of the trend starting at the `intercept` given by the client.

With the following code we will sample the linear signal over the span of a month with the granularity of 4 days and starting with an intercept of 100. Along with this signal we also include two different seasonal signals and some red noise to make it look realistic. We can also observe that we can `add` two signals together to get a composite signal.

```ts
import { Interval, DateTime, Duration } from "timelorde/luxon";
import { Linear, Sinusoidal, Red } from "timelorde";

const trend = new Linear(2, Duration.fromObject({ days: 4 }), 100);
const seasonality = new Sinusoidal(20, Duration.fromObject({ days: 7 })).add(
	new Sinusoidal(4, Duration.fromObject({ days: 1 }))
);
const noise = new Red(0, 3, 0.5);
const timeseries = trend.add(seasonality).add(noise);

const start = DateTime.fromISO("2022-02-10");
const end = DateTime.fromISO("2022-03-10");
const interval = Interval.fromDateTimes(start, end);

const series = timeseries.sample(interval, Duration.fromObject({ hours: 1 }));
```

The return type of `Signal.sample` is an array of type `Sample[]`. The `Sample` type represents the relationship between a `DateTime` instance and the `value` given for that instance as given for the interval and granularity of the sample.

Using our series we can transform the `Sample` type into something our graphing software can recognize. The one I use expects a CVS input. I achieve this using a reduction on the series below.

```ts
series.reduce((acc, { date, value }) => {
	return acc + `${date.toISODate()},${value.toFixed(2)}\n`;
}, "date,values\n");
```

Taking the values for this series and putting it into our favorite graphing software we get the following graph.

![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/working_graph.png)

For the rest of the _README_ we will only show the resulting graph of the series and not the data of the series.

### Trend

The trend signals represent a class of signals that help you define the trend of your time series. We currently have three trends in the project:

-   `Flat`
-   `Linear`
-   `Exponential`

### Noise

The noise signals represent a class of signals that help you define the noise your time series. We currently have two noise signals in the project:

-   `Gaussian`
-   `Red`

### Seasonality

The seasonality signals represent the signals that have a period to them. We currently have only one signal that represents seasonality.

-   `Sinusoidal`

Along with amplitude and frequency, we can also set the offset of the start of the signal. A negative offset will push the signal to the left that many units and a positive offset will shift the signal to the right.

### Composition

We currently have two types of signal composition in `timelorde`. They are the `add` and `mcl` methods of the `Signal` type. The `add` method takes two signals and adds the signals underlying values together while the `mul` method takes two signals and multiplies their values together.

For example,

```ts
import { Interval, DateTime, Duration } from "timelorde/luxon";
import { Linear, Sinusoidal } from "timelorde";

const trend = new Linear(2, Duration.fromObject({ days: 1 }));
const seasonality = new Sinusoidal(2, Duration.fromObject({ hours: 12 }));
const timeseries = trend.add(seasonality);

const start = DateTime.fromISO("2022-03-03");
const end = DateTime.fromISO("2022-03-10");
const interval = Interval.fromDateTimes(start, end);

const series = timeseries.sample(interval, Duration.fromObject({ hours: 1 }));
```

will produce the following graph.
![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/add_graph.png)

whereas multiplying the `trend` and `seasonality` in the following example

```ts
import { Interval, DateTime, Duration } from "timelorde/luxon";
import { Linear, Sinusoidal } from "timelorde";

const trend = new Linear(2, Duration.fromObject({ days: 1 }));
const seasonality = new Sinusoidal(2, Duration.fromObject({ hours: 12 }));
const timeseries = trend.mul(seasonality);

const start = DateTime.fromISO("2022-03-03");
const end = DateTime.fromISO("2022-03-10");
const interval = Interval.fromDateTimes(start, end);

const series = timeseries.sample(interval, Duration.fromObject({ hours: 1 }));
```

will give us the following graph.

![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/mul_graph.png)

### Brief Tutorial

Assume we are tasked with simulating seasonal temperatures here on earth with a slight trend towards a warmer world. This is a working example from the excellent [mockseries](https://mockseries.catheu.tech/) library.

We will assume the following conditions for our simulated series:

-   The temperature has an average value of 12&deg;C
-   The temperature is slowly rising by 0.1&deg;C over a year
-   The approximate max is 25&deg;C and the average min is -1&deg;C
-   The yearly seasonalities are impacted by the warming trend of temperatures and results in bigger yearly temperature swings
-   The noise of the series increases as the temperature increases.
-   The daily seasonality is not impacted by the trend
-   The series sample must be four years long

First we import all the necessary types

```ts
import { Interval, DateTime, Duration } from "timelorde/luxon";
import { Flat, Linear, Sinusoidal, Gaussian } from "timelorde";
```

And we will use a variable `temperature` to represent our current working temperature signal.

```ts
let temperature;
```

and then we start constructing the signals that we need. We model our average constraint by creating a `Flat` signal with the value 12.

```ts
const average = new Flat(12);
```

We model the warming constraint with a `Linear` signal that grows by 0.1&deg;C over a period of one year.

```ts
const warming = new Linear(0.1, Duration.fromObject({ years: 1 }));
```

Adding these two signals together

```ts
temperature = average.add(warming);
```

and sampling over four years with the granularity of one day

```ts
temperature.sample(interval, Duration.fromObject({ days: 1 }));
```

gives us a graph that demonstrates a 0.4&deg;C growth from 12&deg;C to 12.4&deg;C over the span of four years.
![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/warming_step.png)

### Seasonality

Our seasonal changes include both yearly and daily. For our yearly seasonal change we want to show the progression of temperatures through winter, spring, summer, and fall. To calculate the amplitude we need we take the difference between the max and min temperatures and divide it by two. In our example the difference between 25&deg;C and -1&deg;C is 26&deg;C. Dividing this value by 2 and using it as our amplitude we can model the yearly seasonality with creating a new `Sinusoidal` instance with an amplitude of 13 and a duration over one year.

```ts
const yearly = new Sinusoidal(13, Duration.fromObject({ years: 1 }));
```

If we add the yearly signal to the average and warming signal

```ts
temperature = average.add(warming).add(yearly);
```

we have a sinusoidal wave over four years that has a constant amplitude of 13 but with the average increase of 0.4&deg;C.

![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/seasonal_graph.png)

However, our constraints require us to increase the amplitude of the sinusoidal wave as the temperature gets warmer. This is a common pattern in modeling signals and worth pointing out. We can adjust the growth of our warming signal by multiplying it by the yearly seasonal signal.

```ts
const growth = warming.mul(yearly);
```

Sampling over four years with the growth signal gives us the graph

![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/step_growth.png)

which gives a signal for a warming that varies more over the four year growth of the yearly seasonal temperatures. The growth only varies between 5 and -5 degrees at the end of four years which is what we are looking for.

Using the `growth` signal we can replace the `warming` signal in our temperature signal

```ts
temperature = average.add(growth).add(yearly);
```

Graphing `temperature` over four years with a 1 day granularity gives us the graph
![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/step_scaled.png)
in which we can now see the growth of the amplitude over the four years.

### Noise

Naturally occurring temperature series have a certain amount of variability of temperature changes over time that is not defined by trend or the seasonality changes.  This type of variability is called noise and is needed to make any time series look realistic.  To make our working example look more realistic we will add some noise.

We construct some noise by creating a new `Gaussian` instance and a reasonable number of 1 for the mean and 0.5 for the standard deviation.  These values made our series look good and felt reasonable.  For your project you must play with the noise to make it look good to you and your domain.

```ts
let noise = new Gaussian(1, 0.5);
```

Our requirements state that the noise of the signal must grow as the signal amplitude grows. The variable `growth` holds the value of this growth and we will use it to increase the standard deviation of the noise over time.  We multiply `noise` with `growth` to get our new noise

```ts
noise = noise.mul(growth);
```

which will scale the noise depending on the growth of the amplitude of the signal.  Graphing the noise over a span of four years gives us the graph

![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/step_noise.png)

where we can see that the noise varies between 1.5 and -1.5 for the first year and between 9.5 to -9.5 at the fourth year. Adding this noise signal to the current signal for temperature

```ts
temperature = average.add(growth).add(yearly).add(noise);
```

will give us the graph over a four year span
![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/step_add_noise.png)

which is the model we are looking for.

## Wrapping up

This library will help you make amazing time series models that will wow and impress your friends and family. With the various types of signals you can create series that show trends and seasonality, while adding realism through noise signals. This library though impressive is pretty small and is looking to grow.

We are hoping to add the following:

-   Partial Intervals -- Do not produce results for example, weekends.
-   Glitches -- All series have glitches, we should include them

There are a few other time series libraries out there. If you are using python or Java they will have you covered.

-   [mockseries](https://mockseries.catheu.tech/)
-   [TimeSynth](https://github.com/TimeSynth/TimeSynth)
-   [TSimulus](https://tsimulus.readthedocs.io/)

## Licensing

"The code in this project is licensed under MIT license."
