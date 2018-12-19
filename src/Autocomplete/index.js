import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Fuse from 'fuse.js'
import _ from 'lodash'

import './style.css'

class Autocomplete extends Component {
  constructor(props) {
    super(props)

    this.state = {
      displayedList: [],
      itemList: props.itemList
    }

    this.defaultSearchFunc = this.defaultSearchFunc.bind(this)
    this.search = this.search.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  defaultSearchFunc(query) {
    const { getKeys, fuseOptions } = this.props
    fuseOptions['keys'] = getKeys ? getKeys() : ['key']
    console.log(fuseOptions)

    const isStringArray = arr =>
      arr.length === arr.filter(item => typeof item === 'string').length

    const items = isStringArray(this.state.itemList)
      ? this.state.itemList.map(item => {
          return { key: item }
        })
      : this.state.itemList
    const fuse = new Fuse(items, fuseOptions)
    return fuse.search(query)
  }

  async search(query) {
    const { getLabel, customSearchFunc } = this.props
    const searchResults = customSearchFunc
      ? await customSearchFunc(query)
      : this.defaultSearchFunc(query)
    const labelList = getLabel
      ? searchResults.map(item => _.get(item, getLabel()))
      : searchResults.map(item => item.key)

    this.setState({
      displayedList: this.getItemList(labelList)
    })
  }

  async onChange(value) {
    const query = value.target.value
    await this.search(query)
  }

  getItemList(items) {
    const { 
      onItemClick, 
      itemStyle, 
      numOfItems, 
      sliceSize 
    } = this.props

    let key = 0
    const trimmedList = items.slice(0, numOfItems)
    return trimmedList.map(value => {
      const trimmedValue = value.length >= 24 
        ? `${value.slice(0, sliceSize)}...` 
        : value

      return (
        <div
          className="item"
          style={itemStyle}
          onClick={onItemClick}
          key={key++}
        >
          {trimmedValue}
        </div>
      )
    })
  }

  render() {
    const {
      containerStyle, 
      inputStyle, 
      placeholder 
    } = this.props

    return (
      <div className="container" style={containerStyle}>
        <input
          type="text"
          placeholder={placeholder}
          style={inputStyle}
          onChange={this.onChange}
          id="input"
        />
        {this.state.displayedList}
      </div>
    )
  }
}

Autocomplete.propTypes = {
  itemList: PropTypes.array,
  numOfItems: PropTypes.number,
  sliceSize: PropTypes.number,
  fuseOptions: PropTypes.object,
  placeholder: PropTypes.string,
  onItemClick: PropTypes.func,
  customSearchFunc: PropTypes.func,
  inputStyle: PropTypes.object,
  itemStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  getLabel: PropTypes.func,
  getKeys: PropTypes.func
}

Autocomplete.defaultProps = {
  itemList: [],
  numOfItems: 10,
  sliceSize: 24,
  fuseOptions: {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 3,
    maxPatternLength: 2,
    minMatchCharLength: 1
  },
  onItemClick: value => {
    document.getElementById('input').value = value.target.innerHTML
  }
}

export default Autocomplete
