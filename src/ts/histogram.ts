import * as d3 from 'd3';

interface Histogram {
  hist: any;
  width: number;
  height: number;
  x: any;
  y: any;
  draw(data: GeoJSON.FeatureCollection): void;
  drawTimestamp(timestamp: number, data: GeoJSON.FeatureCollection): void;
}

class Histogram implements Histogram {
  constructor(parent: HTMLElement, width: number, height: number) {
    this.width = width;
    this.height = height;
    const hist_margin = 50;
    this.hist = d3
      .select(parent)
      .append('svg')
      .attr('width', width + 2 * hist_margin)
      .attr('height', height + 2 * hist_margin)
      .append('g')
      .attr('transform', `translate(${hist_margin},${hist_margin})`);

    this.x = d3.scaleLinear().domain([6, 10]).range([0, width]);
    this.y = d3.scaleLinear().domain([0, 6000]).range([height, 0]);

    // y.domain([0, d3.max(bins, (d) => d.length)]);

    this.hist
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(this.x));

    this.hist.append('g').call(d3.axisLeft(this.y));
  }

  draw(data: GeoJSON.FeatureCollection) {
    // Histogram intensity

    this.hist.selectAll('.histBins').remove();

    const bin = d3
      .bin()
      .domain(this.x.domain() as [number, number])
      .thresholds(this.x.ticks(60))
      .value((d) => d.properties.magnitude);

    const bins = bin(data);

    this.hist
      .selectAll('.histBins')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', 1)
      .attr(
        'transform',
        (d: d3.Bin<any, any>) =>
          `translate(${this.x(d.x0)},${this.y(d.length)})`,
      )
      .attr('width', (d: d3.Bin<any, any>) =>
        Math.max(this.x(d.x1) - this.x(d.x0) - 1, 0),
      )
      .attr('height', (d: d3.Bin<any, any>) => this.height - this.y(d.length))
      .classed('histBins', true);
  }

  drawTimestamp(timestamp: number, data: GeoJSON.FeatureCollection) {
    // Histogram intensity

    const useData = data.features.filter(
      (d) => d.properties.timeStamp <= timestamp,
    );

    this.hist.selectAll('.histBins').remove();

    const bin = d3
      .bin()
      .domain(this.x.domain() as [number, number])
      .thresholds(this.x.ticks(55))
      .value((d) => d.properties.magnitude);

    const bins = bin(useData);

    this.hist
      .selectAll('.histBins')
      .data(bins)
      .join('rect')
      .attr('x', 1)
      .attr(
        'transform',
        (d: d3.Bin<any, any>) =>
          `translate(${this.x(d.x0)},${this.y(d.length)})`,
      )
      .attr('width', (d: d3.Bin<any, any>) =>
        Math.max(this.x(d.x1) - this.x(d.x0) - 1, 0),
      )
      .attr('height', (d: d3.Bin<any, any>) => this.height - this.y(d.length))
      .classed('histBins', true);
  }
}
export { Histogram };
