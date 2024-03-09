import * as d3 from 'd3';

const width = 800;
const height = 400;

const color = d3
  .scalePow()
  .domain([5.5, 9.5])
  .range(['blue', 'red'])
  .exponent(-8);

const magScale = d3.scaleSqrt().domain([5, 10]).range([2, 20]);

function drawBaseMap(id, projection, land, tectonic) {
  const path = d3.geoPath(projection);
  d3.select(`#${id}`).select('svg').remove();
  const map1 = d3
    .select(`#${id}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  //Container for the gradients
  const defs = map1.append('defs');
  const gradient = defs.append('radialGradient').attr('id', 'gradient');
  gradient
    .append('stop')
    .attr('offset', '10%')
    .attr('stop-color', 'green')
    .attr('stop-opacity', '5%');

  gradient
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-color', 'blue')
    .attr('stop-opacity', '0%');

  //   <defs>
  //     <radialGradient id="myGradient">
  //       <stop offset="10%" stop-color="gold" />
  //       <stop offset="95%" stop-color="red" />
  //     </radialGradient>
  //   </defs>
  //Filter for the outside glow
  var filter = defs.append('filter').attr('id', 'glow');
  filter
    .append('feGaussianBlur')
    .attr('stdDeviation', '3.5')
    .attr('result', 'coloredBlur');
  //   var feMerge = filter.append('feMerge');
  //   feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  //   feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

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

function drawEarthquakes(id, projection, data) {
  const path = d3.geoPath(projection);
  const map = d3.select(`#${id}`).select('svg');

  //   map.selectAll('.earthquake').style('fill', 'url(#gradient)');
  map
    .selectAll('.earthquake')
    // .datum(topojson.feature(data, data.objects.land))
    .data(data)
    .enter()
    .append('path')
    .attr(
      'd',
      path.pointRadius((d) => magScale(d.properties.magnitude)),
    )
    .classed('earthquake', true)
    .style('fill', 'url(#gradient)');

  // .style('fill', (d: any) => {
  //   // console.log(d.properties.eq_primary);
  //   return d.properties.magnitude ? color(d.properties.magnitude) : 'grey';
  // });
}

export { drawBaseMap, drawEarthquakes };
