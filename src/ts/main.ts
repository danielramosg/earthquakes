import * as d3 from 'd3';
console.log(d3); // This is a fix
/**
 * Import is somewhat broken in Parcel
 * https://github.com/parcel-bundler/parcel/issues/8792
 * */
import { geoMollweide } from 'd3-geo-projection';
// import * as topojson from 'topojson-client';

const width = 1000;
const height = 500;

const map1 = d3
  .select('#map1')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

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

const projection = geoMollweide();

const path = d3.geoPath(projection).pointRadius(2);

const color = d3.scaleLinear().domain([5.5, 9.5]).range(['blue', 'red']);

async function main() {
  const land: JSON = await fetch(
    new URL('../carto/land.geojson', import.meta.url).href,
  ).then((data) => data.json());

  const earthquakes: JSON = await fetch(
    new URL('../carto/eqk.geojson', import.meta.url).href,
  ).then((data) => data.json());

  const tectonic: JSON = await fetch(
    new URL('../carto/tectonic.geojson', import.meta.url).href,
  ).then((data) => data.json());

  // Draw land
  map1
    .append('path')
    .datum({ type: 'Sphere' } as unknown as GeoJSON.Feature)
    .attr('d', path)
    .classed('sphere', true);

  map1
    .append('path')
    // .datum(topojson.feature(data, data.objects.land))
    .datum(land)
    .attr('d', path)
    .classed('land', true);

  // Draw earthquakes
  function drawEarthquakesTimeInterval(startYear: number, endYear: number) {
    const data = earthquakes.features.filter(
      (d) => d.properties.year >= startYear && d.properties.year < endYear,
    );
    console.log(data.length);

    map1.selectAll('.earthquake').remove();
    map1
      .selectAll('.earthquake')
      // .datum(topojson.feature(data, data.objects.land))
      .data(data)
      .enter()
      .append('path')
      .attr('d', path)
      .classed('earthquake', true)
      .style('fill', (d: any) => {
        // console.log(d.properties.eq_primary);
        return d.properties.magnitude ? color(d.properties.magnitude) : 'grey';
      });
  }

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

  //Draw tectonics
  map1.append('path').datum(tectonic).attr('d', path).classed('tectonic', true);

  // Make histogram
  makeHistogram(document.getElementById('hist1'), 600, 400, earthquakes);
}

main();

function makeHistogram(parent, width, height, data) {
  const hist_margin = 30;
  const hist1 = d3
    .select(parent)
    .append('svg')
    .attr('width', width + 2 * hist_margin)
    .attr('height', height + 2 * hist_margin)
    .append('g')
    .attr('transform', `translate(${hist_margin},${hist_margin})`);

  // Histogram intensity

  const x = d3.scaleLinear().domain([5, 10]).range([0, width]);

  const bin = d3
    .bin()
    .domain(x.domain() as [number, number])
    .thresholds(x.ticks(60))
    .value((d) => d.properties.magnitude);

  const bins = bin(data.features);
  // console.log(bins);

  hist1;
  var y = d3.scaleLinear().range([height, 0]);
  y.domain([0, d3.max(bins, (d) => d.length)]);

  hist1
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x));

  hist1.append('g').call(d3.axisLeft(y));

  hist1
    .selectAll('.histBins')
    .data(bins)
    .enter()
    .append('rect')
    .attr('x', 1)
    .attr('transform', (d) => `translate(${x(d.x0)},${y(d.length)})`)
    .attr('width', (d) => x(d.x1) - x(d.x0) - 1)
    .attr('height', (d) => height - y(d.length))
    .classed('histBins', true);
}

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
