import { Grid, GridList, GridListTile } from '@material-ui/core';
import EmbeddingWindow from './embeddingWindow';
import MorseSmaleWindow from './morseSmaleWindow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { withDSXContext } from '../dsxContext.js';
import { withStyles } from '@material-ui/core/styles';
import GalleryWindow from './galleryWindow';

const tileHeight     = 160;  // TODO: make this able to be modified interactively (ideally drag the window, passed parameter of not)
const tileWidthMargins  = 50;  // 5+5 image margin + 5+5 paper margin + 20 text + 10 fluff (ugh) 
const tileHeightMargins = 60;  // 5+5 image margin + 5+5 paper margin + 40 text (ugh) 

// these are accessed through `this.props.classes` when bound to the class using withStyles
const styles = (theme) => ({
  embeddingMorseSmaleWorkspace: {
    background:'#ffffff',
    display:'flex',
    flexDirection:'column',
    height:'100%',
    justifyContent:'flex-end',
  },
  topPanels: {
    flex:'auto',
    display:'flex',
    flexDirection:'row',
    justifyContent:'flex-end',
  },
  verticalDivider: {
    background:'#808080',
    width:'5px',
    height:'100%',
    flex:'auto'
  },
  embedding: {
    flex:'auto',
  },
  crystals: {
    flex:'auto',
  },
  drawerDivider: {
    background:'#808080',
    width:'100%',
    height:'1px',
  },
  drawer: {  
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
    gridGap: '0em',
    // height:'100px',   // TODO: this ensures the drawer is present, so un-hack the way we're currently showing it
    // flex:'auto',
  },
  gridlistRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    borderTop: 'solid #A9A9A9',
  },
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)',
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'top',
    border: 'solid #D3D3D3',
  },
});

/**
 * Creates windows that displays the 2D Graph Embedding of the data
 * and the Morse-Smale decomposition
 */
class EmbeddingMorseSmaleWindow extends React.Component {
  /**
   * Creates EmbeddingMorseSmaleWindow object
   * @param {object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      drawerImages: [],
    };

    this.client = this.props.dsxContext.client;

    this.evalModelForCrystal = this.evalModelForCrystal.bind(this);
  }

  /**
   * Computes new samples using shapeodds model
   * @param {number} datasetId
   * @param {string} category
   * @param {string} fieldname
   * @param {number} persistenceLevel
   * @param {number} crystalID
   * @param {number} numSamples
   * @param {bool} showOrig - This doesn't compute new samples, but provides _original_ samples instead.
   * @param {bool} validate - generate model-interpolated images using the z_coords it provided
   * @param {float} percent - distance along crystal from which to find/generate sample (when only one is requested)
   */
  async evalModelForCrystal(crystalID, numSamples, showOrig, validate, diff_validate, percent = 0.0) {
    // Ask server to compute the N new images for this crystal using the requested model, then add them to the drawer
    // If model doesn't exist or showOrig is true, returns original samples for this crystal.
    let result = await this.client.fetchNImagesForCrystal(this.props.decomposition.datasetId,
                                       this.props.decomposition.category,
                                       this.props.decomposition.fieldname,
                                       this.props.distanceMetric,
                                       this.props.decomposition.persistenceLevel,
                                       crystalID,
                                       this.props.decomposition.modelname,
                                       numSamples,
                                       this.props.decomposition.sigmaScale,
                                       showOrig,
                                       validate,
                                       diff_validate,
                                       percent)
    const thumbnails = result.thumbnails.map((thumbnail, i) => {
      return {
        img: thumbnail,
        val: result.fieldvals[i],
        id: result.sampleids[i],
      };
    });
    //console.log('fetchNImagesForCrystal returned ' + result.thumbnails.length + ' images; msg: ' + result.msg);

    // if more than one sample, fill the drawer, otherwise just return the image
    if (numSamples > 1) {
      this.setState({ drawerImages:thumbnails });
    }
    else {
      return thumbnails[0];
    }
  }

  /**
   * Return best number of columms for the drawer shape cards.
   */
  numCols() {
    let width = 1650;  // TODO: how to get actual width (this is good for single workspace window at fullscreen 1920x1200)
    if (this.props.screenWidthHack) width /= 2;
    return width / this.getTileWidth(); 
  }

  /**
   * Return best guess at tile width
   */
  getTileWidth() {
    return this.scaledImageWidth() + tileWidthMargins;
  }

  /**
   * Return best guess at tile height
   */
  getTileHeight() {
    return this.scaledImageHeight() + tileHeightMargins;
  }

  /**
   * Return scaled image width that fits in this tile (aspect ratio considered)
   */
  scaledImageWidth() {
    let images = this.state.drawerImages;
    if (images && images.length > 0) {
      let img = images[0].img;
      let aspect_ratio = img.width / img.height;
      return this.scaledImageHeight() * aspect_ratio;
    }

    return 5; // should never get here, so make it obvious if we do
  }

  /**
   * Return scaled image height that fits in this tile 
   */
  scaledImageHeight() {
    return tileHeight;
  }

  /**
   * Renders EmbeddingMorseSmaleWindow to screen
   * @return {JSX}
   */
  render() {
    const { classes } = this.props;
    const { drawerImages } = this.state;

    return (
        <div className={classes.embeddingMorseSmaleWorkspace} >

          {/* top panel: embedding and crystals */}
          <div className={classes.topPanels} style={{ height:'150px' }} >

            {/* embedding */}
            <div style={{ width:'100%', flex:'auto' }}>
              <EmbeddingWindow className={classes.embedding}
                               dataset={this.props.dataset}
                               decomposition={this.props.decomposition}
                               embedding={this.props.embedding}
                               distanceMetric={this.props.distanceMetric}
                               selectedDesigns={this.props.selectedDesigns}
                               onDesignSelection={this.props.onDesignSelection}
                               activeDesigns={this.props.activeDesigns}
                               drawerImages={this.state.drawerImages}
                               numberOfWindows={this.props.numberOfWindows}/>
            </div>

            {/* embedding/crystals vertical divider */}
            <div className={classes.verticalDivider} />

            {/* crystals */}
            <div style={{ width:'100%', flex:'auto' }}>
              <MorseSmaleWindow className={classes.crystals}
                                dataset={this.props.dataset}
                                decomposition={this.props.decomposition}
                                numberOfWindows={this.props.numberOfWindows}
                                onCrystalSelection={this.props.onCrystalSelection}
                                drawerImages={this.state.drawerImages}
                                evalModelForCrystal={this.evalModelForCrystal}/>
            </div>
          </div>

          {/* drawer divider (todo: onMouseDown={this.onResizeDrawer})*/}
          <div className={classes.drawerDivider} />

          {/* scrollable shape cards drawer */}
          <div className={classes.drawer} >      
            <GridList className={classes.gridList} cols={this.numCols()}>
              {drawerImages.map((tile) => (
              <GridListTile key={tile.id} style={{ height:this.getTileHeight() }} >
                <Paper className={classes.paper}>
                  <Typography>{'Design: ' + (parseInt(tile.id))}</Typography>

                  {/*<Typography>{tile.val.toFixed(5)}</Typography>*/}
                  <Typography>{tile.val.toExponential(4)}</Typography>

                  <img alt={'Image:' + tile.id} key={tile.id}
                       height={this.scaledImageHeight()}
                       width={this.scaledImageWidth()}
                       style={{ margin:'5px 5px 5px 5px' }}
                       src={'data:image/png;base64, ' + tile.img.rawData}/>
                </Paper>
              </GridListTile>))}
            </GridList>
          </div>
        </div>
    );
  }
}

export default withDSXContext(withStyles(styles)(EmbeddingMorseSmaleWindow));
