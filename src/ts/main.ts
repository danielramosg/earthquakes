import * as d3 from 'd3';
import { Map } from './map';
import { Histogram, makeHistogram } from './histogram';
import { geoMollweide } from 'd3-geo-projection';
import { Timeline } from './timeline';
import { Gallery } from './gallery';

console.log(d3); // This is a fix
/**
 * Import is somewhat broken in Parcel
 * https://github.com/parcel-bundler/parcel/issues/8792
 * */

const projection1 = geoMollweide().scale(150).rotate([-40, 0]);
const projection2 = d3.geoOrthographic().scale(150);
const vx = 0.01;
const vy = -0.01;

// const projection = d3
//   .geoConicConformal()
//   .parallels([35, 65])
//   .rotate([-20, 0])
//   .scale(width)
//   .center([0, 52])
//   .translate([width / 2, height / 2])
//   .clipExtent([
//     [0, 0],
//     [width, height],
//   ])
//   .precision(0.2);

const startTime = new Date(Date.UTC(1964, 0, 1)); // all dates and times in UTC
const endTime = new Date(Date.UTC(2023, 11, 31));
const deltaTime = 30 * 24 * 60 * 60 * 1000; // one day, in  milliseconds.

const animationDuration = 30000; // 30 sec
const animationEndTime = 40000;

const startTimeNum = startTime.getTime();
const endTimeNum = endTime.getTime();

const date2timeStamp = (date: Date) =>
  ((date.getTime() - startTimeNum) / (endTimeNum - startTimeNum)) *
  animationDuration;

const timeStamp2date = (t: number) =>
  new Date(
    (t / animationDuration) * (endTimeNum - startTimeNum) + startTimeNum,
  );

async function main() {
  // Fetch data
  const land: GeoJSON.FeatureCollection = await fetch(
    new URL('../carto/land.geojson', import.meta.url).href,
  ).then((data) => data.json());

  const earthquakes: GeoJSON.FeatureCollection = await fetch(
    new URL('../carto/eqk.geojson', import.meta.url).href,
  ).then((data) => data.json());

  const tectonic: GeoJSON.FeatureCollection = await fetch(
    new URL('../carto/tectonic.geojson', import.meta.url).href,
  ).then((data) => data.json());

  console.log(`Loaded ${earthquakes.features.length} data points.`);

  // Add timestamps to earthquakes
  const list = earthquakes.features.forEach((d) => {
    const newDate = new Date(
      Date.UTC(
        d.properties.year,
        (Number(d.properties.month) - 1).toString(),
        d.properties.day,
        d.properties.hour,
        d.properties.minute,
        d.properties.second,
        Math.floor(
          (Number(d.properties.second) -
            Math.floor(Number(d.properties.second))) *
            1000,
        ),
      ),
    );

    d.properties.date = newDate as Date;
    d.properties.timeStamp = date2timeStamp(newDate);
  });

  window.earthquakes = earthquakes;

  // Draw earthquakes

  const timeline = new Timeline(
    document.getElementById('timeline') as HTMLElement,
    1000,
    100,
    startTime,
    endTime,
  );

  const hist = new Histogram(
    document.getElementById('hist1') as HTMLElement,
    600,
    400,
  );

  const gallery = new Gallery(
    document.getElementById('gallery') as HTMLElement,
    600,
    400,
  );

  // gallery.setImages(earthquakes.features.filter((d) => d.properties.notable));

  const map1 = new Map(
    document.getElementById('map1') as HTMLElement,
    1000,
    500,
    projection1,
  );

  map1.drawBaseMap(land, tectonic);
  // map1.drawEarthquakes(earthquakes);
  // map1.drawEarthquakesExploding(10000, earthquakes);
  // map1.drawEarthquakesExploding(40000, earthquakes);

  let zero: number;

  const startAnimation = (time: number) => {
    zero = time;

    map1.clearAccu();
    map1.clearExp();
    map1.clearNot();
    gallery.clearImages();

    animate(time);
  };

  const animate = (time: number) => {
    const t = time - zero;

    map1.drawEarthquakesExploding(t, earthquakes);
    hist.drawTimestamp(t, earthquakes);
    if (t < animationDuration) {
      timeline.setHead(timeStamp2date(t));
    }
    gallery.setImagesTimestamp(t, earthquakes);

    if (t < animationEndTime) {
      requestAnimationFrame((t) => animate(t));
    } else {
      requestAnimationFrame((t) => startAnimation(t));
    }
  };

  requestAnimationFrame(startAnimation);

  // let repeat = setInterval(() => {
  //   const t = performance.now();
  //   projection2.rotate([vx * t, vy * t]);

  //   map1.drawBaseMap(projection1, land, tectonic);
  //   // drawBaseMap('map2', projection2, land, tectonic);

  //   const newTime = new Date(time.getTime() + deltaTime);

  //   const data = earthquakes.features.filter(
  //     (d) =>
  //       d.properties.date.getTime() >= startTime.getTime() &&
  //       d.properties.date.getTime() < newTime.getTime(),
  //   );
  //   // console.log(data.length);

  //   drawEarthquakes('map1', projection1, data);
  //   // drawEarthquakes('map2', projection2, data);

  //   // Make histogram
  //   hist.draw(data);

  //   d3.select('#timeDisplay').html(
  //     `Dates: from ${startTime.toDateString()} to ${newTime.toDateString()}`,
  //   );

  //   if (time.getFullYear() > 2023) {
  //     // year = -100;
  //     clearInterval(repeat);
  //     d3.select('#timeDisplay').html(`1964-2023`);
  //   }
  //   time = newTime;
  // }, 50);
}

main();

// map1
//   .selectAll('.place-label')
//   .data(data.features)
//   .enter()
//   .append('text')
//   .classed('place-label', true)
//   .attr(
//     'transform',
//     (d: any) => `translate(${projection(d.geometry.coordinates)})`,
//   )
//   .attr('dy', '.35em')
//   .attr('dx', '.5em')

//   .text((d: any) => d.properties.name);
