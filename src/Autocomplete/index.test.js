import React from 'react'
import Autocomplete from '.'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import axios from 'axios'

import shortid from 'shortid'
import nestedDummy from '../dummyData/nestedDummy'
import largeDummy from '../dummyData/largeDummy'

Enzyme.configure({ adapter: new Adapter() })

it('uncontrolled string array search', async () => {
  const largeStringList = []
  for (let i = 0; i < 10000; i++) {
    largeStringList.push(shortid.generate())
  }
  const wrapper = shallow(<Autocomplete itemList={largeStringList} />)
  const autocomplete = wrapper.instance()
  await autocomplete.search('')
  expect(autocomplete.state.displayedList.length).toBe(0)
  await autocomplete.search('a')
  expect(autocomplete.state.displayedList.length).toBe(10)
  expect(typeof autocomplete.state.displayedList[0].props.children).toBe(
    'string'
  )
  await autocomplete.search('aaaaaaaaaaaaaaaaaaa')
  expect(autocomplete.state.displayedList.length).toBe(0)
})

it('extend style through props ', () => {
  const wrapper = mount(
    <Autocomplete
      containerStyle={{ color: 'blue' }}
      inputStyle={{ color: 'red' }}
    />
  )
  const containerStyle = wrapper.find('div').render()
  const input = wrapper.find('input').render()
  expect(containerStyle.prop('style').color).toBe('blue')
  expect(input.prop('style').color).toBe('red')
})

it('uncontrolled nested object search', async () => {
  const wrapper = shallow(
    <Autocomplete
      itemList={nestedDummy}
      label={'title'}
      keys={['author.firstName', 'author.lastName']}
    />
  )
  const autocomplete = wrapper.instance()
  await autocomplete.search('John Scalzi')
  expect(autocomplete.state.displayedList.length).toBe(1)
  expect(autocomplete.state.displayedList[0].props.children).toBe(
    "Old Man's War"
  )
})

it('controlled search with async request', async () => {
  const customSearchFunc = async query => {
    if (!query) return []
    const resp = await axios.get('https://jsonplaceholder.typicode.com/posts')
    const itemList = resp.data

    //Jsonplaceholder has a bug which sometimes returns
    //a malformed item at the end of the data list
    //Issue discussed at: 
    //https://github.com/typicode/jsonplaceholder/issues/74
    //Pop the malformed item if present
    if(itemList.length === 101) itemList.pop()

    return itemList.filter(item => item.title.includes(query))
  }
  const wrapper = shallow(
    <Autocomplete
      itemList={largeDummy}
      customSearchFunc={customSearchFunc}
      label={'title'}
    />
  )
  const autocomplete = wrapper.instance()
  await autocomplete.search('lorem')
  expect(autocomplete.state.displayedList.length).not.toBe(0)
})
