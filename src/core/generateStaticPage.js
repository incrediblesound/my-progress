const generateStaticPage = (chain, userTasks) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title></title>
    </head>
    <body>
      <table>
        <tr>
        <th>Date</th>
        ${
          userTasks.reduce((output, task) => {
            return output + `<th>${task}</th>\n`
          }, '')
        }
        </tr>
        ${
          chain.map(day => {
            return `<tr><td>${day.date}</td>\n` + userTasks.reduce((output, task) => {
              const completed = day.tasks[task]
              const color = completed ? 'green' : 'yellow'
              return output + `<td style="background-color: ${color}">${task}</td>\n`
            }, '')
          }).join('</tr>')+'</tr>'
        }
      </table>
    </body>
  </html>
  `
}

module.exports = generateStaticPage
