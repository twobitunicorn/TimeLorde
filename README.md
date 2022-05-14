![](https://github.com/twobitunicorn/TimeLorde/raw/main/img/cool_image.png)

# Time Lorde
Creating time series for demos or testing purposes can be challenging.  The `timelorde` library solves this problem for you.  Using `Luxon` dates as native units of the `x` axis makes it easy to produce signals that work over arbitrary intervals of time.  The library makes it convenient to produce various time series with `trends`, `seasonality`, and `noise`.

https://github.com/twobitunicorn/TimeLorde/raw/main/img/intro_graph.png

## Installing / Getting started

It is easy to get up and running.  You must add it into your `javascript` or `typescript` project.

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

This library makes use of the [`Luxon`](https://moment.github.io/luxon) time and date library.  This excellent library has three primary types that we use in this project: the `DateTime` type, the `Duration` type, and the `Interval` type.  The `DateTime` is an immutable data structure that represents a specific date and accompanying methods.  The `Duration` type represents a period of time such as 2 months or 1 day.  The `Interval` type is an object representing a half-open interval of time where each endpoint is a `DateTime` object.  The `Luxon` library also includes various types to help with the complexity of time zones.  Please check out their documentation [here](https://moment.github.io/luxon/api-docs/)

If you do not already use the `luxon` library you can import the needed types from `timelorde/luxon`.

```
import { Interval, DateTime, Duration,  } from "timelorde/luxon";
```

## Developing
With a bit of understanding how to create the basic `Luxon` types we can start using our library.  We have three major types of signals:
* trend
* seasonality
* noise

Each of the signal types implement a `sample` method that will sample over an `Interval` instance and a fixed `Duration` that represents the granularity of the sampling.  For example, using the type `Linear` with the formal constructor

```ts
Linear(gradient: number, duration: Duration, intercept = 0.0)
```

we can create a linear trend that will climb at the rate of the `gradient` over the `duration` of the trend starting at the `intercept` given by the client.

With the following code we will sample the linear signal over the span of a month with the granularity of 4 days and starting with an intercept of 100.  Along with this signal we also include two different seasonal signals and some red noise to make it look realistic.  We can also observe that we can `add` two signals together to get a composite signal.

```ts
import { Interval, DateTime, Duration,  } from "timelorde/luxon";
import {Linear, Sinusoidal, Red} from "timelorde";


const trend = new Linear(2, Duration.fromObject({days: 4}), 100)
const seasonality = new Sinusoidal(20, Duration.fromObject({days: 7})).add(new Sinusoidal(4, Duration.fromObject({days: 1})))
const noise = new Red(0, 3, 0.5)
const timeseries = trend.add(seasonality).add(noise)

const start = DateTime.fromISO("2022-02-10")
const end = DateTime.fromISO("2022-03-10")
const interval = Interval.fromDateTimes(start, end)

const series = timeseries.sample(interval, Duration.fromObject({hours: 1}))
```

The return type of `Signal.sample` is an array of type `Sample[]`.  The `Sample` type represents the relationship between a `DateTime` instance and the `value` given for that instance as given for the interval and granularity of the sample.

Using our series we can transform the `Sample` type into something our graphing software can recognize.  The one I use expects a CVS input.  I achieve this using a reduction on the series below.

```
series.reduce((acc, {date, value}) => {return acc + `${date.toISODate()},${value.toFixed(2)}\n`}, "date,values\n")
```

Taking the values for this series and putting it into our favorite graphing software we get the following graph.

https://github.com/twobitunicorn/TimeLorde/raw/main/img/working_graph.png

For the rest of the *README* we will only show the resulting graph of the series and not the data of the series.

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
The seasonality signals represent the signals that have a period to them. We currently have only one signal that represents seasonality.
* `Sinusoidal`

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
