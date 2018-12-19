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
    const regEx = new RegExp(query)
    return itemList.filter(item => regEx.exec(item.body))     
  }

  return (
    <div className="App">
      <Autocomplete
        onItemClick={value => {
          document.getElementById('input').value = value.target.innerHTML
        }}
        placeholder={'Uncontrolled'}
        itemList={largeDummyList}
        getLabel={() => 'first_name'}
        getKeys={() => ['first_name', 'last_name', 'email', 'ip_address']}
      />
      <Autocomplete
        onItemClick={value => {
          document.getElementById('input').value = value.target.innerHTML
        }}
        placeholder={'Controlled'}
        customSearchFunc={customSearchFunc}
        getLabel={() => 'title'}
        getKeys={() => ['body']}
      />
    </div>
  )
}

export default App
