import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const width = 1000;
const height = 800;

const svg = d3
  .select('#map')
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

const projection = d3
  .geoConicConformal()
  // .parallels([35, 45])
  // .rotate([-20, 0])
  .scale(width)
  .center([-5, 38])
  .translate([width / 2, height / 2])
  .clipExtent([
    [0, 0],
    [width, height],
  ]);
// .precision(0.2);

const path = d3.geoPath(projection);

fetch(new URL('../carto/land.geojson', import.meta.url).href)
  .then((data) => data.json())
  .then((data) => {
    svg
      .append('path')
      .datum({ type: 'Sphere' } as unknown as GeoJSON.Feature)
      .attr('d', path)
      .style('fill', 'none')
      .style('stroke', 'black');

    svg
      .append('path')
      // .datum(topojson.feature(data, data.objects.land))
      .datum(data)
      .attr('d', path)
      .classed('land', true);
  });

fetch(new URL('../carto/cities.geojson', import.meta.url).href)
  .then((data) => data.json())
  .then((data) => {
    svg
      .append('path')
      // .datum(topojson.feature(data, data.objects.land))
      .datum(data)
      .attr('d', path)
      .classed('city', true);

    svg
      .selectAll('.place-label')
      .data(data.features)
      .enter()
      .append('text')
      .classed('place-label', true)
      .attr(
        'transform',
        (d: any) => `translate(${projection(d.geometry.coordinates)})`,
      )
      .attr('dy', '.35em')
      .attr('dx', '.5em')

      .text((d: any) => d.properties.name);
  });
