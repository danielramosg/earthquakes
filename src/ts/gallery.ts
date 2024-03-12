import * as d3 from 'd3';
import * as imgAssets from './img_assets';

const dateFormatter = new Intl.DateTimeFormat('ca', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

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
    this.gallery = d3.select(parent).classed('gallery', true);
    this.width = width;
    this.height = height;
  }

  setImages(data: GeoJSON.FeatureCollection): void {
    const galleryItem = this.gallery
      .selectAll('.galleryItem')
      .data(data)
      .enter()
      .append('div')
      .classed('galleryItem', true);

    galleryItem
      .append('img')
      .attr('src', (d) => imgAssets[`IMG_${d.properties.photo.split('.')[0]}`]);

    galleryItem
      .append('div')
      .classed('credits', true)
      .text((d) => `Foto: ${d.properties.photo_source}`);

    galleryItem
      .append('div')
      .classed('caption', true)
      .text(
        (d) =>
          `${d.properties.place_ca}, ${dateFormatter.format(
            d.properties.date,
          )}`,
      );
  }

  setImagesTimestamp(timestamp: number, data: GeoJSON.FeatureCollection) {
    const filteredData = data.features.filter(
      (d) => d.properties.notable && d.properties.timeStamp < timestamp,
    );
    this.setImages(filteredData);
  }

  clearImages() {
    this.gallery.selectAll('.galleryItem').remove();
  }
}

export { Gallery };
