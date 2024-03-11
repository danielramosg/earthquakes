import * as d3 from 'd3';

const dateIntler = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'numeric',
});

const dateFormatter = (date: Date) => {
  const s = dateIntler.format(date).split('/');
  return `${s[0].padStart(2, '0')}/${s[1].padStart(4, ' ')}`;
};

interface Timeline {
  timeline: d3.Selection<SVGGElement, any, any, any>;
  headerGroup: d3.Selection<SVGGElement, any, any, any>;
  width: number;
  height: number;
  x: any;
  y: any;
  setHead(time: Date): void;
  drawTimestamp(timestamp: number, data: GeoJSON.FeatureCollection): void;
}

class Timeline implements Timeline {
  constructor(
    parent: HTMLElement,
    width: number,
    height: number,
    startDate: Date,
    endDate: Date,
  ) {
    this.width = width;
    this.height = height;

    this.x = d3
      .scaleTime()
      .domain([startDate, endDate])
      .range([0, width])
      .nice();

    this.timeline = d3
      .select(parent)
      .append('svg')
      .attr('width', this.width + 40)
      .attr('height', this.height)
      .append('g')
      .attr('transform', `translate(20,${this.height / 2})`);

    this.timeline.append('g').call(d3.axisBottom(this.x));

    this.headerGroup = this.timeline.append('g');
    this.headerGroup.append('g').attr('id', 'mainHeader');
    this.headerGroup.append('g').attr('id', 'mainDate');
    this.headerGroup.append('g').attr('id', 'notables');
  }

  setHead(time: Date): void {
    this.headerGroup
      .select('#mainHeader')
      .selectAll('circle')
      .data([time])
      .join('circle')
      .attr('cx', this.x(time))
      .attr('cy', 0)
      .attr('r', 5);

    this.headerGroup
      .select('#mainDate')
      .selectAll('text')
      .data([time])
      .join('text')
      .attr('x', this.x(time))
      .attr('y', -10)
      .text(dateFormatter(time))
      .attr('text-anchor', 'middle');
  }
}

export { Timeline };
