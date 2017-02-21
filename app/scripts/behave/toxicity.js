const BASE_URL = 'https://comments.api.argh.team'

const getMessages = blocks => blocks.map(block => block.text)


export const getToxicity = (blocks, callback) => {
  const messages = { messages: getMessages(blocks) }

  fetch(`${BASE_URL}/api/scores`,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(messages)
    })
    .then(res => res.json())
    .then(data => {
      const { scores } = data
      scores.map((score, index) => {
        blocks[index].toxicity = score
      })
      return callback(blocks)
    })
}