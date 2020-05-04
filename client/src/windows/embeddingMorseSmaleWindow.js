import EmbeddingWindow from './embeddingWindow';
import MorseSmaleWindow from './morseSmaleWindow';
import React from 'react';
import ResponsiveDrawer from '../components/responsiveDrawer';
import { withDSXContext } from '../dsxContext.js';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  mainContainer: {
    'display': 'flex',
    'flex-direction': 'column',
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

    this.computeNewSamplesUsingShapeoddsModel = this.computeNewSamplesUsingShapeoddsModel.bind(this);
  }

  /**
   * Computes new samples using shapeodds model
   * @param {number} datasetId
   * @param {string} category
   * @param {string} fieldname
   * @param {number} persistenceLevel
   * @param {number} crystalID
   * @param {number} numSamples
   * @param {bool} showOrig
   */
  computeNewSamplesUsingShapeoddsModel(datasetId, category, fieldname, persistenceLevel,
    crystalID, numSamples, showOrig) {
    console.log('computeNewSamplesUsingShapeoddsModel('+datasetId+','+fieldname+','+persistenceLevel+','
                +crystalID+','+numSamples+','+showOrig+')');

    // Ask server to compute the N new images for this crystal and add them to the drawer
    this.client.fetchNImagesForCrystal_Shapeodds(datasetId, category, fieldname, persistenceLevel,
      crystalID, numSamples, showOrig)
      .then((result) => {
        const thumbnails = result.thumbnails.map((thumbnail, i) => {
          return {
            img: thumbnail,
            id: i,
          };
        });
        this.setState({ drawerImages:thumbnails });
        console.log('computeNewSamplesUsingShapeoddsModel returned ' + result.thumbnails.length
          + ' images; msg: ' + result.msg);
      });
  }

  /**
   * Renders EmbeddingMorseSmaleWindow to screen
   * @return {JSX}
   */
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.main}>
        <div style={{ background:'#ffffff', height:'80%', width:'100%', display:'flex' }}>
          <div style={{ width:'50%' }}>
            <EmbeddingWindow
              dataset={this.props.dataset}
              decomposition={this.props.decomposition}
              embedding={this.props.embedding}
              selectedDesigns={this.props.selectedDesigns}
              onDesignSelection={this.props.onDesignSelection}
              activeDesigns={this.props.activeDesigns}
              numberOfWindows={this.props.numberOfWindows}/>
          </div>
          <div style={{ width:'50%' }}>
            <MorseSmaleWindow
              style={{ wdith:'50%' }}
              dataset={this.props.dataset}
              decomposition={this.props.decomposition}
              numberOfWindows={this.props.numberOfWindows}
              onCrystalSelection={this.props.onCrystalSelection}
              evalShapeoddsModelForCrystal={this.computeNewSamplesUsingShapeoddsModel}/>
          </div>
        </div>
        <div style={{ background:'#ffffff', height:'20%', display:'flex', flexDirection:'column', overflow:'scroll' }}>
          <ResponsiveDrawer images={this.state.drawerImages}/>
        </div>
      </div>
    );
  }
}

export default withDSXContext(withStyles(styles)(EmbeddingMorseSmaleWindow));

// return (
//   <ResizablePanels
//     bkcolor='#ffffff'
//     displayDirection='column'
//     width='100%'
//     height='100%'
//     panelsSize={[72, 25]}
//     sizeUnitMeasure='%'
//     resizerColor='#808080'
//     resizerSize='1px'>
//     <div style={{ background:'#ffffff', height:'100%', width:'100%' }}>
//       <ResizablePanels
//         bkcolor='#ffffff'
//         displayDirection='row'
//         width='100%'
//         height='100%'
//         panelsSize={[50, 50]}
//         sizeUnitMeasure='%'
//         resizerColor='#808080'
//         resizerSize='1px'>
//         <EmbeddingWindow
//           dataset={this.props.dataset}
//           decomposition={this.props.decomposition}
//           embedding={this.props.embedding}
//           selectedDesigns={this.props.selectedDesigns}
//           onDesignSelection={this.props.onDesignSelection}
//           activeDesigns={this.props.activeDesigns}
//           numberOfWindows={this.props.numberOfWindows}/>
//         <MorseSmaleWindow
//           dataset={this.props.dataset}
//           decomposition={this.props.decomposition}
//           numberOfWindows={this.props.numberOfWindows}
//           onCrystalSelection={this.props.onCrystalSelection}
//           evalShapeoddsModelForCrystal={this.computeNewSamplesUsingShapeoddsModel}/>
//       </ResizablePanels>
//     </div>
//     <div>
//       <ResponsiveDrawer images={this.state.drawerImages}/>
//     </div>
//   </ResizablePanels>
// );
