import React, { Component } from 'react'
import Fuse from 'fuse.js'
import _ from 'lodash'

import './style.css'

class Autocomplete extends Component {
  constructor(props) {
    super(props)

    this.state = {
      displayedList: [],
      itemList: props.itemList || []
    }

    this.defaultSearchFunc = this.defaultSearchFunc.bind(this)
    this.search = this.search.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  defaultSearchFunc(query) {
    const { getKeys } = this.props
    const options = {
      shouldSort: true,
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: getKeys ? getKeys() : ['key']
    }

    const isStringArray = arr =>
      arr.length === arr.filter(item => typeof item === 'string').length

    const items = isStringArray(this.state.itemList)
      ? this.state.itemList.map(item => {
          return { key: item }
        })
      : this.state.itemList
    const fuse = new Fuse(items, options)
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

  getItemList(items, options) {
    const { onItemClick, itemStyle } = this.props
    const { numOfItems = 10, sliceSize = 24 } = options || {}

    let key = 0
    return items.slice(0, numOfItems).map(value => {
      const trimmedValue =
        value.length >= 24 ? `${value.slice(0, sliceSize)}...` : value
      return (
        <div
          className="item"
          style={itemStyle}
          onClick={onItemClick}
          key={++key}
        >
          {trimmedValue}
        </div>
      )
    })
  }

  render() {
    const { containerStyle, inputStyle, placeholder } = this.props

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

export default Autocomplete
