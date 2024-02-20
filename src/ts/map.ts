import * as d3 from 'd3';
import { geoMollweide } from 'd3-geo-projection';

const width = 1000;
const height = 500;

const projection = geoMollweide();

const path = d3.geoPath(projection).pointRadius(2);

const color = d3
  .scalePow()
  .domain([5.5, 9.5])
  .range(['blue', 'red'])
  .exponent(-8);

function drawBaseMap(land, tectonic) {
  const map1 = d3
    .select('#map1')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
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

  //Draw tectonics
  map1.append('path').datum(tectonic).attr('d', path).classed('tectonic', true);
}

function drawEarthquakesTimeInterval(startDate: Date, endDate: Date) {
  const map1 = d3.select('#map1').select('svg');

  const data = earthquakes.features.filter(
    (d) =>
      d.properties.date.getTime() >= startDate.getTime() &&
      d.properties.date.getTime() < endDate.getTime(),
  );
  // console.log(data.length);

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

export { drawBaseMap, drawEarthquakesTimeInterval };
