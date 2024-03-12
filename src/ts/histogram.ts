import * as d3 from 'd3';

interface Histogram {
  hist: any;
  width: number;
  height: number;
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
  drawAreaWidth: number;
  drawAreaHeight: number;
  x: any;
  y: any;
  draw(data: GeoJSON.FeatureCollection): void;
  drawTimestamp(timestamp: number, data: GeoJSON.FeatureCollection): void;
}

class Histogram implements Histogram {
  constructor(parent: HTMLElement, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.margin_top = 10;
    this.margin_bottom = 30;
    this.margin_left = 50;
    this.margin_right = 50;
    this.drawAreaWidth = this.width - this.margin_left - this.margin_right;
    this.drawAreaHeight = this.height - this.margin_top - this.margin_bottom;
    const hist_margin = 50;

    this.hist = d3
      .select(parent)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${this.margin_left},${this.margin_top})`);

    this.x = d3.scaleLinear().domain([6, 10]).range([0, this.drawAreaWidth]);
    this.y = d3.scaleLinear().domain([0, 2500]).range([this.drawAreaHeight, 0]);

    this.hist
      .append('g')
      .attr('transform', `translate(0,${this.drawAreaHeight})`)
      .call(d3.axisBottom(this.x));

    this.hist.append('g').call(d3.axisLeft(this.y));
  }

  draw(data: GeoJSON.FeatureCollection) {
    // Histogram intensity

    this.hist.selectAll('.histBins').remove();

    const bin = d3
      .bin()
      .domain(this.x.domain() as [number, number])
      .thresholds(this.x.ticks(55))
      .value((d) => d.properties.magnitude);

    const bins = bin(data.features);

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
      .attr(
        'height',
        (d: d3.Bin<any, any>) => this.drawAreaHeight - this.y(d.length),
      )
      .classed('histBins', true);
  }

  drawTimestamp(timestamp: number, data: GeoJSON.FeatureCollection) {
    const useData = data.features.filter(
      (d) => d.properties?.timeStamp <= timestamp,
    );

    this.draw({ type: 'FeatureCollection', features: useData });
  }
}
export { Histogram };
