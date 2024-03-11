import * as d3 from 'd3';
import * as imgAssets from './img_assets';

interface Gallery {
  gallery: d3.Selection<HTMLElement, any, any, any>;
  headerGroup: d3.Selection<SVGGElement, any, any, any>;
  width: number;
  height: number;
  x: any;
  y: any;
  setImages(time: Date, data: GeoJSON.FeatureCollection): void;
}

class Gallery implements Gallery {
  constructor(parent: HTMLElement, width: number, height: number) {
    this.gallery = d3.select(parent);
    this.width = width;
    this.height = height;
  }

  setImages(time: Date, data: GeoJSON.FeatureCollection): void {
    this.gallery
      .selectAll('.imageItem')
      .data(data)
      .join('div')
      .classed('imageItem', true)
      .append('img')
      .attr('src', (d) => imgAssets[`IMG_${d.properties.photo.split('.')[0]}`]);
    //   .attr('src', (d) => {
    //     console.log(`IMG_${d.properties.photo.split('.')[0]}`);
    //     return 'aa';
    //   });
  }
}

export { Gallery };
