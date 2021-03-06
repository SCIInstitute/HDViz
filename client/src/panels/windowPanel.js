import Divider from '@material-ui/core/Divider';
import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import DecompositionPanel from './decompositionPanel.js';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';


/**
 * A Window Panel provides a display of the settings associated with any given
 * visualization window in the scene.
 */
class WindowPanel extends React.Component {
  /**
   * WindowPanel constructor.
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.config.id,
      dataViewType: this.props.config.id == 0 ? 'graph' : undefined, // by default first window will be embedding/morsesmale
      tableAttributeGroup: this.props.config.tableAttributeGroup,
      decomposition: null,
      embeddingAlgorithm: this.props.embeddings[0] ? this.props.embeddings[0].name.trim() : 'None',
      distanceMetric: this.props.distanceMetrics ? this.props.distanceMetrics.keys().next().value.trim() : 'None',
      visualizationQoi: null,
      xAttributeGroup: this.props.config.xAttributeGroup,
      xAttribute: this.props.config.xAttribute,
      yAttributeGroup: this.props.config.yAttributeGroup,
      yAttribute: this.props.config.yAttribute,
      markerAttributeGroup: this.props.config.markerAttributeGroup,
      markerAttribute: this.props.config.markerAttribute,
    };

    this.handleDataViewTypeChange = this.handleDataViewTypeChange.bind(this);
    this.handleTableAttributeGroup = this.handleTableAttributeGroup.bind(this);
    this.handleXAttributeGroup = this.handleXAttributeGroup.bind(this);
    this.handleXAttribute = this.handleXAttribute.bind(this);
    this.handleYAttributeGroup = this.handleYAttributeGroup.bind(this);
    this.handleYAttribute = this.handleYAttribute.bind(this);
    this.handleMarkerAttributeGroup = this.handleMarkerAttributeGroup.bind(this);
    this.handleMarkerAttribute = this.handleMarkerAttribute.bind(this);
    this.handleEmbeddingAlgorithmChange = this.handleEmbeddingAlgorithmChange.bind(this);
    this.handleDecompositionChange = this.handleDecompositionChange.bind(this);
    this.handleDistanceMetricChange = this.handleDistanceMetricChange.bind(this);

    this.getTableOptions = this.getTableOptions.bind(this);
    this.getGraphOptions = this.getGraphOptions.bind(this);
    this.getScatterPlotOptions = this.getScatterPlotOptions.bind(this);
  }

  componentDidMount() {
    console.log('windowPanel mounted');
    if (this.props.onConfigChange) {
      console.log('calling props.onConfigChange...');
      this.props.onConfigChange(this.state);
    }
  }

  /**
   * @param {object} prevProps
   * @param {prevState} prevState
   * @param {object} snapshot
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState != this.state) {
      if (this.props.onConfigChange) {
        this.props.onConfigChange(this.state);
      }
    }
  }

  /**
   * Handle the window type changing between table and graph.
   * @param {object} event
   */
  handleDataViewTypeChange(event) {
    let dataViewType = event.target.value;
    this.setState({
      dataViewType: dataViewType,
    });
  }

  /**
   * Handle the table attribute group changing between params and qois.
   * @param {object} event
   */
  handleTableAttributeGroup(event) {
    let tableAttributeGroup = event.target.value;
    this.setState({
      tableAttributeGroup: tableAttributeGroup,
    });
  }

  /**
   * Handles x attribute group change
   * @param {event} event
   */
  handleXAttributeGroup(event) {
    let xAttributeGroup = event.target.value;
    let xAttribute = undefined;
    this.setState({ xAttributeGroup, xAttribute });
  }

  /**
   * Handles x attribute change
   * @param {event} event
   */
  handleXAttribute(event) {
    let xAttribute = event.target.value;
    this.setState({ xAttribute });
  }

  /**
   * Handles y attribute group change
   * @param {event} event
   */
  handleYAttributeGroup(event) {
    let yAttributeGroup = event.target.value;
    let yAttribute = undefined;
    this.setState({ yAttributeGroup, yAttribute });
  }

  /**
   * Handles y attribute change
   * @param {event} event
   */
  handleYAttribute(event) {
    let yAttribute = event.target.value;
    this.setState({ yAttribute });
  }

  /**
   * Handles marker attribute group change
   * @param {event} event
   */
  handleMarkerAttributeGroup(event) {
    let markerAttributeGroup = event.target.value;
    let markerAttribute = undefined;
    this.setState({ markerAttributeGroup, markerAttribute });
  }

  /**
   * Handles marker attribute change
   * @param {event} event
   */
  handleMarkerAttribute(event) {
    let markerAttribute = event.target.value;
    this.setState({ markerAttribute });
  }

  /**
   * Handle the embedding algorithm changing.
   * @param {object} event
   */
  handleEmbeddingAlgorithmChange(event) {
    let algorithm = event.target.value;
    this.setState({
      embeddingAlgorithm: algorithm,
    });
  }

  /**
   * Handle the metric algorithm changing.
   * @param {object} event
   */
  handleDistanceMetricChange(event) {
    let metric = event.target.value;
    this.setState({
      distanceMetric: metric,
    });
  }

  /**
   * Handle the decomposition changing.
   * @param {object} decomposition
   */
  handleDecompositionChange(decomposition) {
    this.setState({
      decomposition: decomposition,
    });
  }

  /**
   * Return the set of table display types.
   * @return {JSX}
   */
  getTableOptions() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        {/* Table Attribute Group Dropdown */}
        <FormControl className={classes.formControl}
          disabled={!this.props.enabled || !this.props.dataset}>
          <InputLabel htmlFor='tablegroup-input'>Attribute Group</InputLabel>
          <Select ref="tablegroupCombo"
            value={this.state.tableAttributeGroup || ''}
            onChange={this.handleTableAttributeGroup} inputProps={{
              name: 'tablegroup',
              id: 'tablegroup-input',
            }}>
            <MenuItem value="parameters"
              disabled={!this.props.dataset.parameterNames.length}>
              <em>Parameters</em>
            </MenuItem>
            <MenuItem value="qois"
              disabled={!this.props.dataset.qoiNames.length}>
              <em>Qois</em>
            </MenuItem>
          </Select>
        </FormControl>
      </React.Fragment>
    );
  }

  /**
   * Get the configurable options for graph types.
   * @return {JSX}
   */
  getGraphOptions() {
    const { classes } = this.props;
    return (
      <React.Fragment>

        <div style={{ height:'8px' }}></div>
        <Divider/>
        <div style={{ height:'8px' }}></div>

        {/* fieldtype, field, and metric selection */}

        {/* Distance Metric Dropdown */}
        <FormControl className={classes.formControl}
          disabled={!this.props.enabled}>
          <InputLabel htmlFor='distmetric-field'>Distance Metric</InputLabel>
          <Select ref="distMetricCombo"
            value={this.state.distanceMetric}
            onChange={this.handleDistanceMetricChange} inputProps={{
              name: 'distmetric',
              id: 'distmetric-input',
            }}>
            {[...this.props.distanceMetrics.keys()].map((metric) =>
              <MenuItem key={metric} value={metric}>
                <em>{metric}</em>
              </MenuItem>)}
          </Select>
        </FormControl>

        <div style={{ height:'8px' }}></div>
        <Accordion disabled={!this.props.enabled || !this.props.dataset}
                   defaultExpanded={false} style={{ paddingLeft:'0px', margin:'1px' }}>
          <AccordionSummary expandIcon={ <ExpandMoreIcon/> }>
            <Typography>Embedding</Typography>
          </AccordionSummary>
          <AccordionDetails style={{ paddingLeft: '1px',
                            paddingRight: '0px', margin: '1px', width: '100%',
                            boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexDirection: 'column',
                 width: '100%', boxSizing: 'border-box' }}>

        {/* Embedding Algorithm Dropdown */}
        <FormControl className={classes.formControl}
          disabled={!this.props.enabled || !this.props.dataset}>
          <InputLabel htmlFor='algorithm-input'>Embedding Algorithm</InputLabel>
          <Select ref="algorithmCombo"
            value={this.state.embeddingAlgorithm}
            onChange={this.handleEmbeddingAlgorithmChange} inputProps={{
              name: 'algorithm',
              id: 'algorithm-input',
            }}>
            {!this.props.embeddings &&
            <MenuItem value="">
              <em>None</em>
            </MenuItem>}
            {this.props.embeddings.map((embedding) =>
              <MenuItem key={embedding.id} value={embedding.name.trim()}>
                <em>{embedding.name}</em>
              </MenuItem>)}
          </Select>
        </FormControl>

        {/* Metric Dropdown */}
        <FormControl className={classes.formControl}
          disabled={!this.props.enabled}>
          <InputLabel htmlFor='metric-field'>Metric</InputLabel>
          <Select ref="metricCombo"
            value="precomputed"
            inputProps={{
              name: 'metric',
              id: 'metric-field',
            }}>
            <MenuItem value='precomputed'>
              <em>Precomputed</em>
            </MenuItem>
            <MenuItem value='l2' disabled={true}>
              <em>L2</em>
            </MenuItem>
            <MenuItem value='l1' disabled={true}>
              <em>L1</em>
            </MenuItem>
          </Select>
        </FormControl>

        </div>
        </AccordionDetails>
        </Accordion>

        {/* Decomposition Panel */}
        <div style={{ height:'8px' }}/>
        <DecompositionPanel
          enabled={this.props.enabled}
          dataset={this.props.dataset}
          distanceMetrics={this.props.distanceMetrics}
          distanceMetric={this.state.distanceMetric}
          onDecompositionChange={this.handleDecompositionChange}
          client={this.client}/>
      </React.Fragment>
    );
  };

  /**
   * Gets the attribute groups
   * @param {string} attributeGroup
   * @return {JSX}
   */
  getAttributeNames(attributeGroup) {
    if (attributeGroup === 'parameters') {
      return this.props.dataset.parameterNames;
    } else if (attributeGroup === 'qois') {
      return this.props.dataset.qoiNames;
    }
  };

  /**
   * Gets the scatter plot options.
   * @return {JSX}
   */
  getScatterPlotOptions() {
    const { classes } = this.props;
    return (
      <Accordion disabled={!this.props.enabled || !this.props.dataset}
        defaultExpanded={true} style={{ paddingLeft:'0px', margin:'1px' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon/>}/>
        <AccordionDetails style={{
          paddingLeft: '15px',
          paddingRight: '10px', margin: '1px', width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column',
            width: '100%', boxSizing: 'border-box',
          }}>
            {/* x axis */}
            <Typography>x-axis</Typography>
            <FormControl className={classes.formControl}
              disabled={!this.props.enabled || !this.props.dataset}
              style={{ width: '100%',
                boxSizing: 'border-box',
                paddingRight: '10px' }}>
              <InputLabel htmlFor='x-group-input'>
                Attribute Group</InputLabel>
              <Select ref="xGroupCombo"
                value={this.state.xAttributeGroup || ''}
                onChange={this.handleXAttributeGroup} inputProps={{
                  name: 'xGroup',
                  id: 'x-group-input',
                }}>
                <MenuItem value="parameters"
                  disabled={!this.props.dataset.parameterNames.length}>
                  <em>Parameters</em>
                </MenuItem>
                <MenuItem value="qois"
                  disabled={!this.props.dataset.qoiNames.length}>
                  <em>Qois</em>
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}
              disabled={!this.props.enabled || !this.props.dataset}>
              <InputLabel htmlFor='x-attribute-input'>
                Attribute</InputLabel>
              <Select ref="xAttributeCombo"
                value={this.state.xAttribute || ''}
                onChange={this.handleXAttribute} inputProps={{
                  name: 'xAttribute',
                  id: 'x-attribute-input',
                }}>
                {this.state.xAttributeGroup
                && this.getAttributeNames(this.state.xAttributeGroup).map((attributeName, i) =>
                  <MenuItem key={i} value={attributeName.trim()}>{attributeName}</MenuItem>)}
              </Select>
            </FormControl>
            {/* y axis */}
            <div style={{ height:'10px' }}/>
            <Typography>y-axis</Typography>
            <FormControl className={classes.formControl}
              disabled={!this.props.enabled || !this.props.dataset}>
              <InputLabel htmlFor='y-group-input'>
                Attribute Group</InputLabel>
              <Select ref="yGroupCombo"
                value={this.state.yAttributeGroup || ''}
                onChange={this.handleYAttributeGroup} inputProps={{
                  name: 'yGroup',
                  id: 'y-group-input',
                }}>
                <MenuItem value="parameters"
                  disabled={!this.props.dataset.parameterNames.length}>
                  <em>Parameters</em>
                </MenuItem>
                <MenuItem value="qois"
                  disabled={!this.props.dataset.qoiNames.length}>
                  <em>Qois</em>
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}
              disabled={!this.props.enabled || !this.props.dataset}>
              <InputLabel htmlFor='y-attribute-input'>
                Attribute</InputLabel>
              <Select ref="yAttributeCombo"
                value={this.state.yAttribute || ''}
                onChange={this.handleYAttribute} inputProps={{
                  name: 'yAttribute',
                  id: 'y-attribute-input',
                }}>
                {this.state.yAttributeGroup &&
                this.getAttributeNames(this.state.yAttributeGroup).map((attributeName, i) =>
                  <MenuItem key={i} value={attributeName.trim()}>{attributeName}</MenuItem>)}
              </Select>
            </FormControl>
            {/* marker area */}
            <div style={{ height:'10px' }}/>
            <Typography>Marker Area</Typography>
            <FormControl className={classes.formControl}
              disabled={!this.props.enabled || !this.props.dataset}>
              <InputLabel htmlFor='marker-group-input'>
                Attribute Group</InputLabel>
              <Select ref="markerGroupCombo"
                value={this.state.markerAttributeGroup || ''}
                onChange={this.handleMarkerAttributeGroup} inputProps={{
                  name: 'markerGroup',
                  id: 'marker-group-input',
                }}>
                <MenuItem value="parameters"
                  disabled={!this.props.dataset.parameterNames.length}>
                  <em>Parameters</em>
                </MenuItem>
                <MenuItem value="qois"
                  disabled={!this.props.dataset.qoiNames.length}>
                  <em>Qois</em>
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}
              disabled={!this.props.enabled || !this.props.dataset}>
              <InputLabel htmlFor='marker-attribute-input'>
                Attribute</InputLabel>
              <Select ref="markerAttributeCombo"
                value={this.state.markerAttribute || ''}
                onChange={this.handleMarkerAttribute} inputProps={{
                  name: 'markerAttribute',
                  id: 'marker-attribute-input',
                }}>
                {this.state.markerAttributeGroup &&
                this.getAttributeNames(this.state.markerAttributeGroup).map((attributeName, i) =>
                  <MenuItem key={i} value={attributeName.trim()}>{attributeName}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        </AccordionDetails>
      </Accordion>
    );
  };

  /**
   * Renders the component to HTML.
   * @return {JSX}
   */
  render() {
    const { classes } = this.props;
    return (
      <Accordion
        disabled={!this.props.enabled} defaultExpanded={true}
        style={{ paddingLeft:'0px', margin:'1px', paddingTop:'0px' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
          <Typography>
            {'Window # ' + (this.props.windowIndex + 1)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{
          paddingLeft: '15px', paddingTop: '0px',
          paddingRight: '10px', marginLeft: '1px', marginRight: '1px',
          width: '100%', boxSizing: 'border-box',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column',
            width: '100%', boxSizing: 'border-box',
          }}>

            {/* DataView Type Dropdown */}
            <FormControl className={classes.formControl}
              disabled={!this.props.enabled || !this.props.dataset}>
              <InputLabel htmlFor='dataview-input'>Data View Type</InputLabel>
              <Select ref="dataviewCombo"
                value={this.state.dataViewType || ''}
                onChange={this.handleDataViewTypeChange} inputProps={{
                  name: 'dataview',
                  id: 'dataview-input',
                }}>
                <MenuItem value="graph">
                  <em>Embedding/Decomposition</em>
                </MenuItem>
                <MenuItem value="gallery">
                  <em>Gallery</em>
                </MenuItem>
                <MenuItem value="scatter_plot">
                  <em>Scatter Plot</em>
                </MenuItem>
                <MenuItem value="table">
                  <em>Table</em>
                </MenuItem>
              </Select>
            </FormControl>
            {
              /* Render the Appropriate Fields for the DataView Type */
              (() => {
                switch (this.state.dataViewType) {
                  case 'table':
                    return this.getTableOptions();
                  case 'graph':
                    return this.getGraphOptions();
                  case 'scatter_plot':
                    return this.getScatterPlotOptions();
                  default:
                    return null;
                }
              })()
            }

          </div>
        </AccordionDetails>
      </Accordion>
    );
  }
}

// Enforce that Application receives styling.
WindowPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

// Wrap WindowPanel in Styling Container.
export default withStyles({})(WindowPanel);
