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
      query: ''
    }

    this.defaultSearchFunc = this.defaultSearchFunc.bind(this)
    this.search = this.search.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onItemClick = this.onItemClick.bind(this)
  }

  defaultSearchFunc(query) {
    const { itemList, getKeys, fuseOptions } = this.props
    fuseOptions['keys'] = getKeys ? getKeys() : ['key']

    const isStringArray = arr =>
      arr.length === arr.filter(item => typeof item === 'string').length

    const items = isStringArray(itemList)
      ? itemList.map(item => {
          return { key: item }
        })
      : itemList
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
    await this.setState({ query: value.target.value })
    await this.search(this.state.query)
  }

  onItemClick = async value => {
    const { onSelect } = this.props

    await this.setState({
      displayedList: [],
      query: value.target.innerHTML
    })
    if (onSelect) onSelect(this)
  }

  getItemList(items) {
    const { itemStyle, numOfItems, sliceSize } = this.props

    let key = 0
    const trimmedList = items.slice(0, numOfItems)
    return trimmedList.map(value => {
      const trimmedValue =
        value.length >= 24 ? `${value.slice(0, sliceSize)}...` : value

      return (
        <div
          className="item"
          style={itemStyle}
          onClick={this.onItemClick}
          key={key++}
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
          ref={this.input}
          value={this.state.query}
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
  customSearchFunc: PropTypes.func,
  inputStyle: PropTypes.object,
  itemStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  getLabel: PropTypes.func,
  getKeys: PropTypes.func,
  onSelect: PropTypes.func
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
  }
}

export default Autocomplete
