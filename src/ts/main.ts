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

const projection1 = geoMollweide().scale(160).rotate([-40, 0]);
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

  // Initialize Elements

  const timeline = new Timeline(
    document.getElementById('timeline') as HTMLElement,
    window.innerWidth,
    100,
    startTime,
    endTime,
  );

  const hist = new Histogram(
    document.getElementById('hist1') as HTMLElement,
    400,
    300,
  );

  const gallery = new Gallery(
    document.getElementById('gallery') as HTMLElement,
    800,
    1000,
  );

  const map1 = new Map(
    document.getElementById('map1') as HTMLElement,
    1000,
    500,
    projection1,
  );

  map1.drawBaseMap(land, tectonic);

  // gallery.setImages(earthquakes.features.filter((d) => d.properties.notable));

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
}

main();
