import * as d3 from 'd3';
import { drawBaseMap, drawEarthquakesTimeInterval } from './map';
import { makeHistogram } from './histogram';

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

  let year = 1964;

  let repeat = setInterval(() => {
    drawEarthquakesTimeInterval(year, year + 1);
    year += 1;
    d3.select('#yearDisplay').html(`Years: ${year} to ${year + 1}`);

    if (year > 2023) {
      // year = -100;
      clearInterval(repeat);
      drawEarthquakesTimeInterval(-2000, 2050);
      d3.select('#yearDisplay').html(`Years: all history`);
    }
  }, 500);

  // Make histogram
  makeHistogram(document.getElementById('hist1'), 600, 400, earthquakes);
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
