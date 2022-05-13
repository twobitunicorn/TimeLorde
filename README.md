![Time Lorde](https://github.com/twobitunicorn/TimeLorde/blob/015fed4c5dc1a13dc8a7d5e4f5aee7437d7751b5/img/cool_image.png)

# Time Lorde
Creating time series for demos or testing purposes can be challenging.  The `timelorde` library solves this problem for you.  Using `Luxon` dates as native units of the `x` axis makes it easy to produce signals that work over arbitrary intervals of time.  The library makes it convenient to produce various time series with `trends`, `seasonality`, and `noise`.

## Installing / Getting started

It is easy to get up and running.  You must add it into your `javascript` or `typescript` project.

### pnpm
```shell
pnpm add @timelorde
```

### yarn
```shell 
yarn install @timelorde
```

### npm
```shell
npm install @timelorde
```

This should install `timelorde` into your project. 


## Developing

This library makes use of the [`Luxon`](https://moment.github.io/luxon) time and date library.  This excellent library has three primary types that we use in this project: the `DateTime` type, the `Duration` type, and the `Interval` type.  The `DateTime` is an immutable data structure that represents a specific date and accompanying methods.  The `Duration` type represents a period of time such as 2 months or 1 day, 1 hour.  The `Interval` type is an object representing a half-open interval of time where each endpoint is a `DateTime` object.  The `Luxon` library also includes various types to help with the complexity of time zones.  Please check out their documentation [here](https://moment.github.io/luxon/api-docs/)

With a bit of understanding how to create the basic `Luxon` types we can start using our library.  We have three major types of signals:
* trend
* seasonality
* noise

Each of the signal types implement a `sample` method that will sample over an `Interval` instance and a fixed `Duration` that represents the granularity of the sampling.  For example, using the type `Linear` with the formal constructor
```ts
Linear(gradient: number, duration: Duration, intercept = 0.0)
```

we can create a linear trend that will climb at the rate of the `gradient` over the `duration` of the trend starting at the `intercept` given by the client.

With the following code we will sample the linear signal over the span of a week with the granularity of a single day.

```ts
import { DateTime, Duration, Interval } from '@timelorde/luxon'
import { Linear } from '@timelorde/trends'

const start = DateTime.fromISO("2022-03-03")
const end = DateTime.fromISO("2022-03-10")
const interval = Interval.fromDateTimes(start, end)
const trend = new Linear(2, Duration.fromObject({week: 1}), 8)
const series = trend.sample(interval, Duration.fromObject({hours: 1}))
```

The return type of `Signal.sample` is an array of type `Sample[]`.  The `Sample` type represents the relationship between a `DateTime` instance and the `value` given for that instance as given for the interval and granularity of the sample.  Inspecting the state of `series` we will see

```ts
[
  {
    date: DateTime {
      ts: 1646294400000,
      _zone: SystemZone {},
      loc: [Locale],
      invalid: null,
      weekData: null,
      c: [Object],
      o: -480,
      isLuxonDateTime: true
    },
    value: 8
  },
  {
    date: DateTime {
      ts: 1646380800000,
      _zone: SystemZone {},
      loc: [Locale],
      invalid: null,
      weekData: null,
      c: [Object],
      o: -480,
      isLuxonDateTime: true
    },
    value: 8.285714149475098
  },
  {
    date: DateTime {
      ts: 1646467200000,
      _zone: SystemZone {},
      loc: [Locale],
      invalid: null,
      weekData: null,
      c: [Object],
      o: -480,
      isLuxonDateTime: true
    },
    value: 8.571428298950195
  },
  {
    date: DateTime {
      ts: 1646553600000,
      _zone: SystemZone {},
      loc: [Locale],
      invalid: null,
      weekData: null,
      c: [Object],
      o: -480,
      isLuxonDateTime: true
    },
    value: 8.85714340209961
  },
  {
    date: DateTime {
      ts: 1646640000000,
      _zone: SystemZone {},
      loc: [Locale],
      invalid: null,
      weekData: null,
      c: [Object],
      o: -480,
      isLuxonDateTime: true
    },
    value: 9.142857551574707
  },
  {
    date: DateTime {
      ts: 1646726400000,
      _zone: SystemZone {},
      loc: [Locale],
      invalid: null,
      weekData: null,
      c: [Object],
      o: -480,
      isLuxonDateTime: true
    },
    value: 9.428571701049805
  },
  {
    date: DateTime {
      ts: 1646812800000,
      _zone: SystemZone {},
      loc: [Locale],
      invalid: null,
      weekData: null,
      c: [Object],
      o: -480,
      isLuxonDateTime: true
    },
    value: 9.714285850524902
  }
]
``` 

Each element of the array is of type `Sample`. This type has the declaration

```ts
interface Sample {
	date: DateTime;
	value: number;
}
```

Outputting a more palatable version of the series can be done with either `JSON.stringify` or a simple map.

For example,
```ts
console.log(JSON.stringify(series))
```

will give us
```ts
[
  { "date": "2022-03-03T00:00:00.000-08:00", "value": 8 },
  { "date": "2022-03-04T00:00:00.000-08:00", "value": 8.285714149475098 },
  { "date": "2022-03-05T00:00:00.000-08:00", "value": 8.571428298950195 },
  { "date": "2022-03-06T00:00:00.000-08:00", "value": 8.85714340209961 },
  { "date": "2022-03-07T00:00:00.000-08:00", "value": 9.142857551574707 },
  { "date": "2022-03-08T00:00:00.000-08:00", "value": 9.428571701049805 },
  { "date": "2022-03-09T00:00:00.000-08:00", "value": 9.714285850524902 }
]
```

which is equal to 

```ts
series.map(({date, ...rest}) =>  {return {date: date.toISO(), ...rest}})
```

Taking the values for this series and putting it into our favorite graphing software we get the following graph.

https://github.com/twobitunicorn/TimeLorde/blob/50520fde4bdf80e495eb427639e9f337a8cae98d/img/intro_graph.png

For the rest of the *README* we will only show the resulting graph of the series and not the data of the series.

## Pro Tip
To export to CSV reduce the series to a single string and output as you see fit.

```ts
series.reduce((acc, {date, value}) => {return acc + `${date},${value}\n`}, "date,values\n")
```

### Trend

The trend signals represent a class of signals that help you define the trend of your time series.  We currently have three trends in the project:
* `Flat`
* `Linear`
* `Exponential`

### Noise
The noise signals represent a class of signals that help you define the noise your time series.  We currently have two noise signals in the project:
* `Gaussian`
* `Red`

```ts
import { DateTime, Duration, Interval } from '@timelorde/luxon'
import { Gaussian } from '@timelorde/noise'

const start = DateTime.fromISO("2021-03-03")
const duration = Duration.fromObject({year: 1})
const interval = Interval.after(start, duration)
const noise = new Flat(7)
const series = trend.sample(interval, Duration.fromObject({hours: 12}))
```

### Seasonality
The seasonality signals represent the signals that have a period to them.  They are found in the 
A flat trend represents a trend that stays flat through time.  A linear trend represents a trend that grows by For example,
```ts
import { DateTime, Duration, Interval } from '@timelorde/luxon'
import { Flat } from '@timelorde/trends'

const start = DateTime.fromISO("2021-03-03")
const duration = Duration.fromObject({year: 1})
const interval = Interval.after(start, duration)
const trend = new Flat(7)
const series = trend.sample(interval, Duration.fromObject({hours: 12}))
```
gives us the graph

/img/flat_graph.png

To get started you must first import the library.  Find your favorite `[.js,.ts]` file and import `timelorde`

```ts

```

And state what happens step-by-step.

### Building

If your project needs some additional steps for the developer to build the
project after some code changes, state them here:

```shell
./configure
make
make install
```

Here again you should state what actually happens when the code above gets
executed.

### Deploying / Publishing

In case there's some step you have to take that publishes this project to a
server, this is the right time to state it.

```shell
packagemanager deploy awesome-project -s server.com -u username -p password
```

And again you'd need to tell what the previous code actually does.

## Features

What's all the bells and whistles this project can perform?
* What's the main functionality
* You can also do another thing
* If you get really randy, you can even do this

## Configuration

Here you should write what are all of the configurations a user can enter when
using the project.

#### Argument 1
Type: `String`  
Default: `'default value'`

State what an argument does and how you can use it. If needed, you can provide
an example below.

Example:
```bash
awesome-project "Some other value"  # Prints "You're nailing this readme!"
```

#### Argument 2
Type: `Number|Boolean`  
Default: 100

Copy-paste as many of these as you need.

## Contributing

When you publish something open source, one of the greatest motivations is that
anyone can just jump in and start contributing to your project.

These paragraphs are meant to welcome those kind souls to feel that they are
needed. You should state something like:

"If you'd like to contribute, please fork the repository and use a feature
branch. Pull requests are warmly welcome."

If there's anything else the developer needs to know (e.g. the code style
guide), you should link it here. If there's a lot of things to take into
consideration, it is common to separate this section to its own file called
`CONTRIBUTING.md` (or similar). If so, you should say that it exists here.

## Links

Even though this information can be found inside the project on machine-readable
format like in a .json file, it's good to include a summary of most useful
links to humans using your project. You can include links like:

- Project homepage: https://your.github.com/awesome-project/
- Repository: https://github.com/your/awesome-project/
- Issue tracker: https://github.com/your/awesome-project/issues
  - In case of sensitive bugs like security vulnerabilities, please contact
    my@email.com directly instead of using issue tracker. We value your effort
    to improve the security and privacy of this project!
- Related projects:
  - Your other project: https://github.com/your/other-project/
  - Someone else's project: https://github.com/someones/awesome-project/


## Licensing

One really important part: Give your project a proper license. Here you should
state what the license is and how to find the text version of the license.
Something like:

"The code in this project is licensed under MIT license."
