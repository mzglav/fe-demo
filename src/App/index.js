import React from 'react'
import './style.css'
import largeDummyList from '../dummyData/largeDummy.json'
import axios from 'axios'

import Autocomplete from '../Autocomplete'

const App = () => {
  const customSearchFunc = async query => {
    if (!query) return []
    const resp = await axios.get('https://jsonplaceholder.typicode.com/posts')
    const itemList = resp.data
    return itemList.filter(item => item.title.includes(query))
  }

  return (
    <div className="App">
      <Autocomplete
        onSelect={(context) => {
          alert(`You chose ${context.state.query}`)
        }}
        placeholder={'Uncontrolled'}
        itemList={largeDummyList}
        getLabel={() => 'first_name'}
        getKeys={() => ['first_name', 'second_name']}
      />
      <Autocomplete
        placeholder={'Controlled'}
        customSearchFunc={customSearchFunc}
        getLabel={() => 'title'}
      />
    </div>
  )
}

export default App
