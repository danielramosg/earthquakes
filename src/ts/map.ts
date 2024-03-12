import * as d3 from 'd3';

const explosionDuration = 1000;

// const color = d3
//   .scalePow()
//   .domain([5.5, 9.5])
//   .range(['blue', 'red'])
//   .exponent(-8);

const magScale = d3.scaleSqrt().domain([5, 10]).range([0, 30]);
const easing = (t: number) => d3.easeQuadInOut(t);

interface Map {
  projection: d3.GeoProjection;
  cnvBase: HTMLCanvasElement; // base layer: land, tectonic plaques
  cnvAccu: HTMLCanvasElement; // accumulated earthquakes
  cnvExp: HTMLCanvasElement; // exploding earthquakes
  cnvNot: HTMLCanvasElement; // notable earthquakes
  ctxBase: CanvasRenderingContext2D;
  ctxAccu: CanvasRenderingContext2D;
  ctxExp: CanvasRenderingContext2D;
  ctxNot: CanvasRenderingContext2D;
  pathBase: d3.GeoPath;
  pathAccu: d3.GeoPath;
  pathExp: d3.GeoPath;
  pathNot: d3.GeoPath;
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

    this.cnvBase = d3
      .select(parent)
      .append('canvas')
      //   .classed('mapLayer', true)
      .attr('width', width)
      .attr('height', height)
      .node() as HTMLCanvasElement;

    this.ctxBase = this.cnvBase.getContext('2d') as CanvasRenderingContext2D;

    this.cnvAccu = d3
      .select(parent)
      .append('canvas')
      .classed('mapLayer', true)
      .attr('width', width)
      .attr('height', height)
      .node() as HTMLCanvasElement;

    this.ctxAccu = this.cnvAccu.getContext('2d') as CanvasRenderingContext2D;

    this.cnvExp = d3
      .select(parent)
      .append('canvas')
      .classed('mapLayer', true)
      .attr('width', width)
      .attr('height', height)
      .node() as HTMLCanvasElement;

    this.ctxExp = this.cnvExp.getContext('2d') as CanvasRenderingContext2D;

    this.cnvNot = d3
      .select(parent)
      .append('canvas')
      .classed('mapLayer', true)
      .attr('width', width)
      .attr('height', height)
      .node() as HTMLCanvasElement;

    this.ctxNot = this.cnvNot.getContext('2d') as CanvasRenderingContext2D;

    this.pathBase = d3.geoPath(this.projection, this.ctxBase);
    this.pathAccu = d3.geoPath(this.projection, this.ctxAccu);
    this.pathExp = d3.geoPath(this.projection, this.ctxExp);
    this.pathNot = d3.geoPath(this.projection, this.ctxNot);

    this.ctxNot.fillStyle = 'red';
    this.pathNot.pointRadius(3);
  }

  drawBaseMap(
    land: GeoJSON.FeatureCollection,
    tectonic: GeoJSON.FeatureCollection,
  ) {
    this.ctxBase.beginPath();
    this.pathBase(land);
    this.ctxBase.fill();

    this.ctxBase.strokeStyle = 'blue';
    this.ctxBase.beginPath();
    this.pathBase(tectonic);
    this.ctxBase.stroke();

    this.ctxBase.strokeStyle = 'black';
    this.ctxBase.beginPath();
    this.pathBase({ type: 'Sphere' });
    this.ctxBase.stroke();
  }

  drawEarthquakes(data: GeoJSON.FeatureCollection) {
    this.pathAccu.pointRadius((d) => magScale(Number(d.properties.magnitude)));

    this.ctxAccu.fillStyle = 'rgba(255, 0, 0, 1)';
    this.ctxAccu.filter = 'blur(3px)';

    this.ctxAccu?.beginPath();
    data.features.forEach((d) => this.pathAccu(d));
    this.ctxAccu?.fill();
  }

  drawEarthquakesExploding(timestamp: number, data: GeoJSON.FeatureCollection) {
    this.ctxExp.clearRect(0, 0, this.width, this.height);

    this.ctxExp.strokeStyle = 'yellow';
    this.ctxExp.filter = 'opacity(80%)';

    this.ctxAccu.fillStyle = 'rgba(0, 255, 255, 1)';
    this.ctxAccu.filter = 'blur(6px) opacity(30%)';
    // this.ctxAccu.filter = 'opacity(30%)';

    this.ctxExp.beginPath();
    this.ctxAccu.beginPath();
    this.ctxNot.beginPath();

    data.features.forEach((d) => {
      const time = (timestamp - d.properties.timeStamp) / explosionDuration;

      if (time > 0 && time < 1) {
        this.pathExp.pointRadius(
          easing(time) * magScale(Number(d.properties.magnitude)),
        );
        this.pathExp(d);
      }

      if (Math.abs(time) < 1e-2) {
        this.pathAccu.pointRadius(
          magScale(Number(d.properties.magnitude)) * 0.3,
        );
        this.pathAccu(d);

        if (d.properties.notable) {
          this.pathNot(d);
          console.log(d.properties.place_en);
        }
      }
    });

    this.ctxExp.stroke();
    this.ctxAccu.fill();
    this.ctxNot.fill();
  }

  clearBase() {
    this.ctxBase.clearRect(0, 0, this.width, this.height);
  }
  clearExp() {
    this.ctxExp.clearRect(0, 0, this.width, this.height);
  }
  clearAccu() {
    this.ctxAccu.clearRect(0, 0, this.width, this.height);
  }
  clearNot() {
    this.ctxNot.clearRect(0, 0, this.width, this.height);
  }
}

export { Map };
