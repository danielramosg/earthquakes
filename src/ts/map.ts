import * as d3 from 'd3';

const width = 800;
const height = 400;

const explosionDuration = 1000;

// const color = d3
//   .scalePow()
//   .domain([5.5, 9.5])
//   .range(['blue', 'red'])
//   .exponent(-8);

const magScale = d3.scaleSqrt().domain([5, 10]).range([2, 30]);
const easing = (t: number) => d3.easeQuadInOut(t);

interface Map {
  projection: d3.GeoProjection;
  baseLayer: HTMLCanvasElement;
  eqkAccuLayer: HTMLCanvasElement;
  eqkLayer: HTMLCanvasElement;
  width: number;
  height: number;
  drawBaseMap(
    land: GeoJSON.FeatureCollection,
    tectonic: GeoJSON.FeatureCollection,
  ): void;
  drawEarthquakes(data: GeoJSON.FeatureCollection): void;
}

class Map implements Map {
  constructor(
    parent: HTMLElement,
    width: number,
    height: number,
    projection: d3.GeoProjection,
  ) {
    this.projection = projection;
    this.width = width;
    this.height = height;

    this.projection.translate([width / 2, height / 2]);

    d3.select(parent).classed('map', true);

    this.baseLayer = d3
      .select(parent)
      .append('canvas')
      //   .classed('mapLayer', true)
      .attr('width', width)
      .attr('height', height)
      .node() as HTMLCanvasElement;

    this.eqkAccuLayer = d3
      .select(parent)
      .append('canvas')
      .classed('mapLayer', true)
      .attr('width', width)
      .attr('height', height)
      .node() as HTMLCanvasElement;

    this.eqkLayer = d3
      .select(parent)
      .append('canvas')
      .classed('mapLayer', true)
      .attr('width', width)
      .attr('height', height)
      .node() as HTMLCanvasElement;
  }

  drawBaseMap(
    land: GeoJSON.FeatureCollection,
    tectonic: GeoJSON.FeatureCollection,
  ) {
    const cnv = this.baseLayer;
    const ctx = cnv.getContext('2d') as CanvasRenderingContext2D;

    const path = d3.geoPath(this.projection, ctx);

    ctx.beginPath();
    path(land);
    ctx.fill();

    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    path(tectonic);
    ctx.stroke();

    ctx.strokeStyle = 'black';
    ctx.beginPath();
    path({ type: 'Sphere' });
    ctx.stroke();
  }

  drawEarthquakes(data: GeoJSON.FeatureCollection) {
    const cnv = this.eqkAccuLayer;
    const ctx = cnv.getContext('2d') as CanvasRenderingContext2D;

    const path = d3
      .geoPath(this.projection, ctx)
      .pointRadius((d) => magScale(Number(d.properties.magnitude)) * 0.3);

    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.filter = 'blur(3px)';

    ctx?.beginPath();
    data.features.forEach((d) => path(d));
    ctx?.fill();
  }

  drawEarthquakesExploding(timestamp: number, data: GeoJSON.FeatureCollection) {
    const cnv = this.eqkLayer;
    const ctx = cnv.getContext('2d') as CanvasRenderingContext2D;

    ctx?.clearRect(0, 0, this.width, this.height);
    const path = d3.geoPath(this.projection, ctx).pointRadius((d) => {
      const time = (timestamp - d.properties.timeStamp) / explosionDuration;

      if (time > 0 && time < 1) {
        // ctx.filter = `opacity(${(1 - easing(time)) * 100}%)`;
        // return 4;
        return easing(time) * magScale(Number(d.properties.magnitude));
      } else {
        return 0;
      }
    });

    ctx.strokeStyle = 'rgba(0, 255, 255, 1)';

    ctx.beginPath();
    data.features.forEach((d) => path(d));
    ctx.stroke();
  }
}

export { Map };
