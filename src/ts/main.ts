import * as d3 from 'd3';
import { drawBaseMap, drawEarthquakes } from './map';
import { Histogram, makeHistogram } from './histogram';

console.log(d3); // This is a fix
/**
 * Import is somewhat broken in Parcel
 * https://github.com/parcel-bundler/parcel/issues/8792
 * */

import { geoMollweide } from 'd3-geo-projection';
// import * as topojson from 'topojson-client';

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

async function main() {
  // Fetch data
  const land: JSON = await fetch(
    new URL('../carto/land.geojson', import.meta.url).href,
  ).then((data) => data.json());

  const earthquakes: JSON = await fetch(
    new URL('../carto/eqk.geojson', import.meta.url).href,
  ).then((data) => data.json());

  const tectonic: JSON = await fetch(
    new URL('../carto/tectonic.geojson', import.meta.url).href,
  ).then((data) => data.json());

  // Add timestamps to earthquakes
  const list = earthquakes.features.forEach((d) => {
    d.properties.date = new Date(
      Date.UTC(
        d.properties.year,
        d.properties.month - 1,
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
  });

  window.earthquakes = earthquakes;

  drawBaseMap(land, tectonic);
  // Draw earthquakes

  const hist = new Histogram(
    document.getElementById('hist1') as HTMLElement,
    600,
    400,
  );

  const startTime = new Date(Date.UTC(1964, 0, 1)); // all dates and times in UTC
  const deltaTime = 30 * 24 * 60 * 60 * 1000; // one day, in  milliseconds.
  let time = startTime;

  let repeat = setInterval(() => {
    const newTime = new Date(time.getTime() + deltaTime);

    const data = earthquakes.features.filter(
      (d) =>
        d.properties.date.getTime() >= startTime.getTime() &&
        d.properties.date.getTime() < newTime.getTime(),
    );
    // console.log(data.length);

    drawEarthquakes(data);

    // Make histogram
    hist.draw(data);

    d3.select('#timeDisplay').html(
      `Dates: from ${time.toISOString()} to ${newTime.toISOString()}`,
    );

    if (time.getFullYear() > 2023) {
      // year = -100;
      clearInterval(repeat);
      drawEarthquakesTimeInterval(new Date(1964, 0, 1), new Date());
      d3.select('#timeDisplay').html(`All history`);
    }
    time = newTime;
  }, 50);
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
