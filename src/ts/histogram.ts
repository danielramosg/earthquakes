import * as d3 from 'd3';

function makeHistogram(
  parent: HTMLElement,
  width: number,
  height: number,
  data: GeoJSON.FeatureCollection,
) {
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

export { makeHistogram };
